import { ObjectId } from "mongodb";
import { z } from "zod";
import { AIProviderError, generateAIText } from "@/lib/ai/server";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import { todayKey } from "@/lib/data/personalization";
import {
  dailyPlansColl,
  userWritingDraftsColl,
  userWritingProgressColl,
  userWritingSubmissionsColl,
  writingTasksColl,
} from "@/lib/models/collections";
import type {
  CEFRLevel,
  UserDoc,
  WritingErrorSeverity,
  WritingErrorType,
  WritingFeedback,
  WritingTaskDoc,
} from "@/lib/models/types";

export const WRITING_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export const WRITING_TOPICS = [
  "Wohnung",
  "Arbeit",
  "Behörden",
  "Krankenkasse",
  "Arzt",
  "Bewerbung",
  "Jobcenter",
  "Einkauf",
  "Reise",
  "Ausbildung",
  "Studium",
  "Alltag",
] as const;
export const WRITING_TYPES = [
  "formal_email",
  "informal_message",
  "complaint",
  "request",
  "application",
  "appointment",
  "opinion_text",
  "exam_letter",
] as const;
export const WRITING_STATUSES = ["new", "in_progress", "completed"] as const;

const MAX_TEXT_LENGTH = 8_000;
const FEEDBACK_ERROR_TYPES = ["grammar", "vocabulary", "word_order", "article", "case", "spelling", "style"] as const;
const FEEDBACK_SEVERITIES = ["low", "medium", "high"] as const;

const FeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  estimatedLevel: z.enum(WRITING_LEVELS),
  summary: z.string(),
  correctedText: z.string(),
  improvedVersion: z.string(),
  errors: z.array(z.object({
    type: z.enum(FEEDBACK_ERROR_TYPES),
    original: z.string(),
    correct: z.string(),
    explanationRu: z.string(),
    severity: z.enum(FEEDBACK_SEVERITIES),
  })),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
  weakAreas: z.array(z.string()),
  usefulPhrases: z.array(z.string()),
});

export const DraftSchema = z.object({
  text: z.string().max(MAX_TEXT_LENGTH),
});

export const CheckWritingSchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(MAX_TEXT_LENGTH, "Text is too long"),
});

export const TaskFilterSchema = z.object({
  level: z.enum(WRITING_LEVELS).optional(),
  topic: z.enum(WRITING_TOPICS).optional(),
  type: z.enum(WRITING_TYPES).optional(),
  status: z.enum(WRITING_STATUSES).optional(),
});

export function parseObjectId(id: string, label = "id") {
  if (!ObjectId.isValid(id)) throw new WritingRequestError(`Invalid ${label}`, 400);
  return new ObjectId(id);
}

export async function getWritingTask(taskId: ObjectId) {
  const task = await (await writingTasksColl()).findOne({ _id: taskId });
  if (!task) throw new WritingRequestError("Writing task not found", 404);
  return task;
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sanitizeWritingText(text: string) {
  return text.replace(/\u0000/g, "").trim();
}

export async function saveDraft(user: UserDoc, taskId: ObjectId, rawText: string) {
  await getWritingTask(taskId);
  const text = sanitizeWritingText(rawText).slice(0, MAX_TEXT_LENGTH);
  const now = new Date();
  const draft = await (await userWritingDraftsColl()).findOneAndUpdate(
    { userId: user._id, taskId },
    {
      $set: { text, updatedAt: now },
      $setOnInsert: { _id: new ObjectId(), userId: user._id, taskId },
    },
    { upsert: true, returnDocument: "after" }
  );
  await upsertWritingProgress(user._id, taskId, { status: text ? "in_progress" : "new" });
  return draft;
}

export async function checkWriting(user: UserDoc, task: WritingTaskDoc, rawText: string, interfaceLocale: string) {
  const text = sanitizeWritingText(rawText);
  if (!text) throw new WritingRequestError("Text cannot be empty", 400);
  if (text.length > MAX_TEXT_LENGTH) throw new WritingRequestError("Text is too long", 400);

  const wordCount = countWords(text);
  const raw = await generateAIText({
    system: buildWritingSystemPrompt(interfaceLocale),
    messages: [{ role: "user", content: buildWritingUserPrompt(user, task, text, wordCount) }],
    maxTokens: 4096,
    responseMimeType: "application/json",
  });
  const feedback = normalizeFeedback(raw, task, text, wordCount);
  const submission = await saveSubmission(user, task, text, feedback);
  await completeWritingDailyPlanStep(user, task, feedback.score);
  await saveDraft(user, task._id, text);
  return { submission, feedback, wordCount };
}

export async function saveSubmission(user: UserDoc, task: WritingTaskDoc, text: string, feedback: WritingFeedback) {
  const submissions = await userWritingSubmissionsColl();
  const existingCount = await submissions.countDocuments({ userId: user._id, taskId: task._id });
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    userId: user._id,
    taskId: task._id,
    attemptNumber: existingCount + 1,
    text,
    aiFeedback: feedback,
    score: feedback.score,
    estimatedLevel: feedback.estimatedLevel,
    weakAreas: feedback.weakAreas,
    createdAt: now,
  };
  await submissions.insertOne(doc);
  await upsertWritingProgress(user._id, task._id, {
    submissionId: doc._id,
    score: feedback.score,
    weakAreas: feedback.weakAreas,
    completed: feedback.score >= 60 && countWords(text) >= Math.floor(task.minWords * 0.8),
  });
  await recordProgressActivity(user._id, {
    writingsDone: 1,
    minutesStudied: Math.max(task.estimatedMinutes, Math.ceil(countWords(text) / 8)),
    correctAnswers: Math.round(feedback.score / 10),
    totalAnswers: 10,
  });
  return doc;
}

export async function upsertWritingProgress(
  userId: ObjectId,
  taskId: ObjectId,
  options: {
    status?: "new" | "in_progress" | "completed";
    submissionId?: ObjectId;
    score?: number;
    weakAreas?: string[];
    completed?: boolean;
  }
) {
  const now = new Date();
  const progress = await userWritingProgressColl();
  const existing = await progress.findOne({ userId, taskId });
  const completed = options.completed === true;
  const nextStatus = completed ? "completed" : options.status ?? existing?.status ?? "in_progress";
  const attemptsCount = options.submissionId ? (existing?.attemptsCount ?? 0) + 1 : existing?.attemptsCount ?? 0;
  const bestScore = typeof options.score === "number"
    ? Math.max(existing?.bestScore ?? 0, options.score)
    : existing?.bestScore ?? null;

  await progress.updateOne(
    { userId, taskId },
    {
      $set: {
        status: nextStatus,
        bestScore,
        attemptsCount,
        lastSubmissionId: options.submissionId ?? existing?.lastSubmissionId ?? null,
        completedAt: completed ? now : existing?.completedAt ?? null,
        updatedAt: now,
      },
      $setOnInsert: { _id: new ObjectId(), userId, taskId },
    },
    { upsert: true }
  );
}

export async function completeWritingDailyPlanStep(user: UserDoc, task: WritingTaskDoc, score: number) {
  const plans = await dailyPlansColl();
  const plan = await plans.findOne({ userId: user._id, planDate: todayKey() });
  if (!plan) return;

  const now = new Date();
  const steps = plan.steps.map((step) => {
    if (step.type !== "writing" || step.status === "completed" || step.templateId !== task._id.toString()) return step;
    return {
      ...step,
      status: "completed" as const,
      completed: true,
      startedAt: step.startedAt ?? now,
      completedAt: now,
      result: {
        ...(step.result ?? {}),
        accuracy: score,
        correctAnswers: Math.round(score / 10),
        totalAnswers: 10,
        timeSpentMinutes: task.estimatedMinutes,
      },
    };
  });
  const changed = steps.some((step, index) => step !== plan.steps[index]);
  if (!changed) return;

  const nextIndex = steps.findIndex((step) => step.status !== "completed");
  if (nextIndex >= 0) {
    steps[nextIndex] = { ...steps[nextIndex], status: "in_progress", startedAt: steps[nextIndex].startedAt ?? now };
  }
  const stepsCompleted = steps.filter((step) => step.status === "completed").length;
  const complete = stepsCompleted === steps.length;
  await plans.updateOne(
    { _id: plan._id, userId: user._id },
    {
      $set: {
        steps,
        stepsCompleted,
        progressPercent: Math.round((stepsCompleted / steps.length) * 100),
        status: complete ? "completed" : "in_progress",
        completedAt: complete ? now : plan.completedAt,
        startedAt: plan.startedAt ?? now,
      },
    }
  );
}

function buildWritingSystemPrompt(interfaceLocale: string) {
  return `You are a strict but supportive German writing teacher.
Return ONLY valid JSON. No markdown. No prose outside JSON.
Explain mistakes in the user's interface language. Interface locale: ${interfaceLocale}.
Do not rewrite everything without explaining concrete errors.
Check grammar, articles, cases, word order, spelling, vocabulary and style.
Give separate correctedText and improvedVersion.
Score must be 0-100. If text is too short for the task, give useful feedback but do not give a high score.`;
}

function buildWritingUserPrompt(user: UserDoc, task: WritingTaskDoc, text: string, wordCount: number) {
  return `User German level: ${user.currentGermanLevel}
Target task level: ${task.level}
Task title: ${task.title}
Topic: ${task.topic}
Type: ${task.type}
Minimum words: ${task.minWords}
Current words: ${wordCount}
Instructions:
${task.instructions}

Requirements:
${task.requirements.map((item) => `- ${item}`).join("\n")}

Student text:
"""${text}"""

Return exactly this JSON shape:
{
  "score": 0,
  "estimatedLevel": "A2",
  "summary": "string",
  "correctedText": "string",
  "improvedVersion": "string",
  "errors": [
    {
      "type": "grammar | vocabulary | word_order | article | case | spelling | style",
      "original": "string",
      "correct": "string",
      "explanationRu": "string",
      "severity": "low | medium | high"
    }
  ],
  "strengths": ["string"],
  "suggestions": ["string"],
  "weakAreas": ["string"],
  "usefulPhrases": ["string"]
}`;
}

function normalizeFeedback(raw: string, task: WritingTaskDoc, text: string, wordCount: number): WritingFeedback {
  const parsed = FeedbackSchema.safeParse(parseModelJson(raw));
  if (!parsed.success) {
    throw new WritingRequestError("AI returned malformed feedback. Please try again.", 502);
  }

  const feedback = parsed.data;
  const scoreCap = wordCount < Math.floor(task.minWords * 0.5) ? 45 : wordCount < task.minWords ? 70 : 100;
  return {
    ...feedback,
    score: clampScore(Math.min(feedback.score, scoreCap)),
    correctedText: feedback.correctedText || text,
    improvedVersion: feedback.improvedVersion || feedback.correctedText || text,
    errors: feedback.errors.slice(0, 30).map((error) => ({
      type: normalizeErrorType(error.type),
      original: error.original.slice(0, 300),
      correct: error.correct.slice(0, 300),
      explanationRu: error.explanationRu.slice(0, 700),
      severity: normalizeSeverity(error.severity),
    })),
    strengths: feedback.strengths.slice(0, 8),
    suggestions: [
      ...(wordCount < task.minWords ? [`Текст короче минимального объема: ${wordCount}/${task.minWords} слов.`] : []),
      ...feedback.suggestions,
    ].slice(0, 10),
    weakAreas: normalizeWeakAreas(feedback.weakAreas),
    usefulPhrases: feedback.usefulPhrases.slice(0, 10),
  };
}

function parseModelJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("No JSON object found");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeErrorType(value: string): WritingErrorType {
  return FEEDBACK_ERROR_TYPES.includes(value as WritingErrorType) ? value as WritingErrorType : "grammar";
}

function normalizeSeverity(value: string): WritingErrorSeverity {
  return FEEDBACK_SEVERITIES.includes(value as WritingErrorSeverity) ? value as WritingErrorSeverity : "medium";
}

function normalizeWeakAreas(values: string[]) {
  const known = new Map([
    ["artikel", "Artikel"],
    ["article", "Artikel"],
    ["akkusativ", "Akkusativ"],
    ["dativ", "Dativ"],
    ["word order", "Word order"],
    ["wortstellung", "Word order"],
    ["perfekt", "Perfekt"],
    ["formal style", "Formal style"],
    ["style", "Formal style"],
  ]);
  const normalized = values
    .map((value) => known.get(value.trim().toLowerCase()) ?? value.trim())
    .filter(Boolean);
  return [...new Set(normalized)].slice(0, 10);
}

export function publicAIError(error: unknown) {
  if (error instanceof WritingRequestError) {
    return { message: error.message, status: error.status };
  }
  if (error instanceof AIProviderError) {
    return { message: error.publicMessage, status: error.status };
  }
  return { message: "Failed to check writing", status: 500 };
}

export class WritingRequestError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "WritingRequestError";
  }
}

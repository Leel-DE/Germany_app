import { z } from "zod";
import { ObjectId } from "mongodb";
import { generateAIText, AIProviderError } from "@/lib/ai/server";
import { readingTextDTO } from "@/lib/data/dto";
import { readingTextsColl } from "@/lib/models/collections";
import type { CEFRLevel, MiniTestQuestion } from "@/types";
import type { ReadingProfile } from "./personalization";

const GeneratedReadingSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(500).max(5000),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2"]),
  topic: z.string().min(2).max(80),
  questions: z.array(z.object({
    question: z.string().min(5).max(240),
    options: z.array(z.string().min(1).max(160)).min(3).max(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().min(5).max(300),
  })).min(3).max(5),
});

const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    title: { type: "string" },
    content: { type: "string" },
    cefrLevel: { type: "string", enum: ["A1", "A2", "B1", "B2"] },
    topic: { type: "string" },
    questions: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", minItems: 3, maxItems: 4, items: { type: "string" } },
          answer: { type: "number" },
          explanation: { type: "string" },
        },
        required: ["question", "options", "answer", "explanation"],
        propertyOrdering: ["question", "options", "answer", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "content", "cefrLevel", "topic", "questions"],
  propertyOrdering: ["title", "content", "cefrLevel", "topic", "questions"],
  additionalProperties: false,
};

export interface GenerateReadingTextInput {
  level?: CEFRLevel;
  topic?: string;
}

export async function generateReadingTextWithAI(profile: ReadingProfile, input: GenerateReadingTextInput = {}) {
  const requestedLevel = input.level ?? pickTargetLevel(profile.currentLevel, profile.targetLevel);
  const requestedTopic = input.topic?.trim() || pickTopic(profile);

  const raw = await generateAIText({
    system: "You generate German reading practice for language learners. Return only valid JSON matching the schema.",
    messages: [{ role: "user", content: buildPrompt(profile, requestedLevel, requestedTopic) }],
    maxTokens: 2600,
    responseMimeType: "application/json",
    responseJsonSchema: RESPONSE_SCHEMA,
  });

  const parsed = GeneratedReadingSchema.safeParse(parseJson(raw));
  if (!parsed.success) {
    throw new Error("AI returned invalid reading JSON.");
  }

  const data = normalizeGeneratedReading(parsed.data, requestedLevel, requestedTopic);
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    title: data.title,
    content: data.content,
    cefr_level: data.cefrLevel,
    topic: data.topic,
    word_count: countWords(data.content),
    read_time_min: estimateReadTime(data.content),
    questions: data.questions,
    isSystem: false,
    createdBy: new ObjectId(profile.userId),
    createdAt: now,
  };

  await (await readingTextsColl()).insertOne(doc);
  return readingTextDTO(doc);
}

export function getReadingAIErrorMessage(error: unknown) {
  if (error instanceof AIProviderError) return error.publicMessage;
  if (error instanceof Error) return error.message;
  return "Could not generate reading text.";
}

function buildPrompt(profile: ReadingProfile, level: CEFRLevel, topic: string) {
  return JSON.stringify({
    task: "Create one useful German reading text with a comprehension quiz.",
    learner: {
      currentLevel: profile.currentLevel,
      targetLevel: profile.targetLevel,
      profession: profile.profession,
      weakAreas: profile.weakAreas,
      preferredTopics: profile.preferredTopics,
    },
    requestedText: {
      cefrLevel: level,
      topic,
      length: "180-320 German words",
      style: "natural, practical, suitable for living and working in Germany",
    },
    constraints: [
      "Text content must be in German only.",
      "Quiz questions and explanations can be in Russian.",
      "Use vocabulary appropriate to the requested CEFR level.",
      "Avoid markdown.",
      "The answer field is the zero-based index of the correct option.",
      "Every question must be answerable from the text.",
    ],
  });
}

function normalizeGeneratedReading(
  data: z.infer<typeof GeneratedReadingSchema>,
  fallbackLevel: CEFRLevel,
  fallbackTopic: string
) {
  return {
    title: data.title.trim(),
    content: data.content.trim(),
    cefrLevel: data.cefrLevel ?? fallbackLevel,
    topic: data.topic.trim() || fallbackTopic,
    questions: data.questions
      .map((question): MiniTestQuestion => ({
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()).filter(Boolean),
        answer: Math.min(question.answer, question.options.length - 1),
        explanation: question.explanation.trim(),
      }))
      .filter((question) => question.options.length >= 3),
  };
}

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI did not return JSON.");
    return JSON.parse(match[0]);
  }
}

function pickTargetLevel(currentLevel: CEFRLevel, targetLevel: CEFRLevel): CEFRLevel {
  const order: CEFRLevel[] = ["A1", "A2", "B1", "B2"];
  const current = order.indexOf(currentLevel);
  const target = order.indexOf(targetLevel);
  return order[Math.min(Math.max(current, target), current + 1)] ?? currentLevel;
}

function pickTopic(profile: ReadingProfile) {
  return profile.weakAreas[0] ?? profile.preferredTopics[0] ?? profile.profession ?? "Alltag in Deutschland";
}

function countWords(content: string) {
  return content.match(/[A-Za-zÄÖÜäöüß]+(?:[-'][A-Za-zÄÖÜäöüß]+)*/g)?.length ?? 0;
}

function estimateReadTime(content: string) {
  return Math.max(2, Math.ceil(countWords(content) / 120));
}

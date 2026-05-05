import { ObjectId } from "mongodb";
import { dailyPlanDTO, grammarDTO, readingTextDTO, vocabularyDTO, writingTaskDTO } from "@/lib/data/dto";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import { calculateNextReview } from "@/lib/srs/sm2";
import {
  dailyPlansColl,
  grammarTopicsColl,
  placementQuestionsColl,
  readingTextsColl,
  srsReviewsColl,
  userGrammarProgressColl,
  userReadingProgressColl,
  userVocabProgressColl,
  userWritingSubmissionsColl,
  vocabularyColl,
  writingTasksColl,
} from "@/lib/models/collections";
import type {
  DailyPlanDoc,
  PlanStep,
  PlanStepResult,
  SRSRating,
  UserDoc,
} from "@/lib/models/types";

export async function enrichedDailyPlanDTO(plan: DailyPlanDoc) {
  const base = dailyPlanDTO(plan);
  return {
    ...base,
    active_task_id: getActiveTask(plan)?.id ?? null,
    steps: await Promise.all(plan.steps.map((step, index) => enrichStep(step, index))),
  };
}

export async function startPlan(user: UserDoc, plan: DailyPlanDoc) {
  if (plan.status !== "pending") return plan;
  const now = new Date();
  const steps = normalizeSteps(plan.steps).map((step, index) =>
    index === 0 ? { ...step, status: "in_progress" as const, startedAt: step.startedAt ?? now } : step
  );
  await (await dailyPlansColl()).updateOne(
    { _id: plan._id, userId: user._id },
    { $set: { status: "in_progress", startedAt: plan.startedAt ?? now, steps } }
  );
  return { ...plan, status: "in_progress" as const, startedAt: plan.startedAt ?? now, steps };
}

export async function startTask(user: UserDoc, plan: DailyPlanDoc, taskId: string) {
  const steps = normalizeSteps(plan.steps);
  const index = steps.findIndex((step) => step.id === taskId);
  if (index < 0) throw new FlowError("Task not found", 404);
  if (steps.some((step, i) => i < index && step.status !== "completed")) {
    throw new FlowError("Complete previous tasks first", 409);
  }
  if (steps[index].status === "completed") return plan;

  const now = new Date();
  steps[index] = { ...steps[index], status: "in_progress", startedAt: steps[index].startedAt ?? now };
  await (await dailyPlansColl()).updateOne(
    { _id: plan._id, userId: user._id },
    { $set: { status: "in_progress", startedAt: plan.startedAt ?? now, steps } }
  );
  return { ...plan, status: "in_progress" as const, startedAt: plan.startedAt ?? now, steps };
}

export async function completeTask(user: UserDoc, plan: DailyPlanDoc, taskId: string, payload: unknown) {
  const steps = normalizeSteps(plan.steps);
  const index = steps.findIndex((step) => step.id === taskId);
  if (index < 0) throw new FlowError("Task not found", 404);
  if (steps.some((step, i) => i < index && step.status !== "completed")) {
    throw new FlowError("Complete previous tasks first", 409);
  }
  if (steps[index].status === "completed") return plan;

  const now = new Date();
  const result = await applyTaskCompletion(user, steps[index], payload);
  steps[index] = {
    ...steps[index],
    status: "completed",
    completed: true,
    completedAt: now,
    startedAt: steps[index].startedAt ?? now,
    result,
  };
  const nextIndex = steps.findIndex((step) => step.status !== "completed");
  if (nextIndex >= 0) {
    steps[nextIndex] = { ...steps[nextIndex], status: "in_progress", startedAt: steps[nextIndex].startedAt ?? now };
  }

  const stepsCompleted = steps.filter((step) => step.status === "completed").length;
  const complete = stepsCompleted === steps.length;
  const accuracy = averageAccuracy(steps);
  await (await dailyPlansColl()).updateOne(
    { _id: plan._id, userId: user._id },
    {
      $set: {
        steps,
        stepsCompleted,
        progressPercent: Math.round((stepsCompleted / steps.length) * 100),
        status: complete ? "completed" : "in_progress",
        score: complete ? accuracy : plan.score,
        startedAt: plan.startedAt ?? now,
        completedAt: complete ? now : null,
      },
    }
  );

  if (complete) {
    await recordProgressActivity(user._id, {});
  }

  return (await (await dailyPlansColl()).findOne({ _id: plan._id, userId: user._id })) ?? plan;
}

export function normalizeSteps(steps: PlanStep[]) {
  return steps.map((rawStep, index) => {
    const rawType = rawStep.type as string;
    const type = rawType === "srs_review" ? "vocabulary_review" : rawType === "mini_test" ? "test" : rawStep.type;
    return {
      ...rawStep,
      type: type as PlanStep["type"],
      id: rawStep.id ?? `${type}-${index}`,
      status: rawStep.status ?? (rawStep.completed ? "completed" as const : index === 0 ? "in_progress" as const : "pending" as const),
      order: rawStep.order ?? index,
      payload: rawStep.payload ?? {},
      startedAt: rawStep.startedAt ?? null,
      completedAt: rawStep.completedAt ?? null,
      result: rawStep.result ?? null,
    };
  });
}

export function getActiveTask(plan: DailyPlanDoc) {
  return normalizeSteps(plan.steps).find((step) => step.status !== "completed") ?? null;
}

export function planResultDTO(plan: DailyPlanDoc, streak: number) {
  const steps = normalizeSteps(plan.steps);
  const totals = steps.reduce(
    (acc, step) => ({
      correct: acc.correct + (step.result?.correctAnswers ?? 0),
      total: acc.total + (step.result?.totalAnswers ?? 0),
      wordsLearned: acc.wordsLearned + (step.result?.wordsLearned ?? 0),
      timeSpent: acc.timeSpent + (step.result?.timeSpentMinutes ?? step.estimatedMinutes),
    }),
    { correct: 0, total: 0, wordsLearned: 0, timeSpent: 0 }
  );
  return {
    completed: plan.status === "completed",
    tasks_completed: steps.filter((step) => step.status === "completed").length,
    total_tasks: steps.length,
    accuracy: totals.total ? Math.round((totals.correct / totals.total) * 100) : plan.score ?? 0,
    words_learned: totals.wordsLearned,
    weak_areas: plan.focusAreas,
    time_spent: totals.timeSpent,
    streak,
  };
}

async function enrichStep(step: PlanStep, index: number) {
  const normalized = normalizeSteps([step])[0];
  const payload = normalized.payload ?? {};

  if (normalized.type === "vocabulary_review" || normalized.type === "new_words") {
    const wordIds = normalized.wordIds ?? asStringArray(payload.wordIds);
    const objectIds = wordIds.filter(ObjectId.isValid).map((id) => new ObjectId(id));
    const [words, progressRows] = await Promise.all([
      objectIds.length ? (await vocabularyColl()).find({ _id: { $in: objectIds } }).toArray() : [],
      objectIds.length ? (await userVocabProgressColl()).find({ wordId: { $in: objectIds } }).toArray() : [],
    ]);
    const progressByWord = new Map(progressRows.map((row) => [row.wordId.toString(), row]));
    return {
      ...normalized,
      order: normalized.order ?? index,
      payload: {
        ...payload,
        words: words.map((word) => vocabularyDTO(word, progressByWord.get(word._id.toString()))),
      },
    };
  }

  if (normalized.type === "grammar" && normalized.topicSlug) {
    const topic = await (await grammarTopicsColl()).findOne({ slug: normalized.topicSlug, isPublished: true });
    return { ...normalized, payload: { ...payload, lesson: topic ? grammarDTO(topic) : null } };
  }

  if (normalized.type === "reading" && normalized.textId && ObjectId.isValid(normalized.textId)) {
    const text = await (await readingTextsColl()).findOne({ _id: new ObjectId(normalized.textId) });
    return { ...normalized, payload: { ...payload, text: text ? readingTextDTO(text) : null } };
  }

  if (normalized.type === "writing" && normalized.templateId && ObjectId.isValid(normalized.templateId)) {
    const task = await (await writingTasksColl()).findOne({ _id: new ObjectId(normalized.templateId) });
    return { ...normalized, payload: { ...payload, task: task ? writingTaskDTO(task) : null } };
  }

  if (normalized.type === "test") {
    const questions = await (await placementQuestionsColl())
      .find({})
      .sort({ order: 1 })
      .limit(8)
      .toArray();
    return {
      ...normalized,
      payload: {
        ...payload,
        questions: questions.map((question) => ({
          id: question._id.toString(),
          question: question.question_de,
          prompt_ru: question.question_ru,
          options: question.options,
          area: question.area,
        })),
      },
    };
  }

  return normalized;
}

async function applyTaskCompletion(user: UserDoc, step: PlanStep, payload: unknown): Promise<PlanStepResult> {
  if (step.type === "vocabulary_review") return completeVocabularyReview(user, step, payload);
  if (step.type === "new_words") return completeNewWords(user, step);
  if (step.type === "grammar") return completeGrammar(user, step, payload);
  if (step.type === "reading") return completeReading(user, step, payload);
  if (step.type === "writing") return completeWriting(user, step, payload);
  if (step.type === "test") return completeTest(user, step, payload);
  return { timeSpentMinutes: step.estimatedMinutes };
}

async function completeVocabularyReview(user: UserDoc, step: PlanStep, payload: unknown) {
  const ratings = isRecord(payload) && isRecord(payload.ratings) ? payload.ratings : {};
  const wordIds = step.wordIds ?? asStringArray(step.payload.wordIds);
  let correctAnswers = 0;
  let reviewed = 0;
  let learned = 0;
  const progressColl = await userVocabProgressColl();
  const reviewsColl = await srsReviewsColl();
  const now = new Date();

  for (const id of wordIds) {
    if (!ObjectId.isValid(id)) continue;
    const rating = ratings[id];
    if (!isSrsRating(rating)) continue;
    const wordId = new ObjectId(id);
    const progress = await progressColl.findOne({ userId: user._id, wordId });
    if (!progress) continue;
    const result = calculateNextReview(progress, rating);
    await progressColl.updateOne(
      { _id: progress._id, userId: user._id },
      {
        $set: {
          easeFactor: result.newEaseFactor,
          intervalDays: result.newInterval,
          repetitionCount: result.newRepetitionCount,
          dueDate: result.nextDueDate.toISOString().slice(0, 10),
          lastReviewedAt: now,
          status: result.newRepetitionCount >= 3 ? "review" : "learning",
        },
        $inc: rating === "again" ? { wrongCount: 1 } : { correctCount: 1 },
      }
    );
    await reviewsColl.insertOne({
      _id: new ObjectId(),
      userId: user._id,
      wordId,
      rating,
      reviewedAt: now,
      intervalBefore: progress.intervalDays,
      intervalAfter: result.newInterval,
    });
    reviewed += 1;
    if (rating !== "again") correctAnswers += 1;
    if (progress.repetitionCount === 0 && rating !== "again") learned += 1;
  }

  await recordProgressActivity(user._id, {
    wordsReviewed: reviewed,
    wordsLearned: learned,
    correctAnswers,
    totalAnswers: reviewed,
    minutesStudied: step.estimatedMinutes,
  });

  return {
    correctAnswers,
    totalAnswers: reviewed,
    accuracy: reviewed ? Math.round((correctAnswers / reviewed) * 100) : 0,
    wordsReviewed: reviewed,
    wordsLearned: learned,
    timeSpentMinutes: step.estimatedMinutes,
  };
}

async function completeNewWords(user: UserDoc, step: PlanStep) {
  const wordIds = step.wordIds ?? asStringArray(step.payload.wordIds);
  const objectIds = wordIds.filter(ObjectId.isValid).map((id) => new ObjectId(id));
  if (objectIds.length) {
    const dueDate = new Date().toISOString().slice(0, 10);
    await (await userVocabProgressColl()).bulkWrite(
      objectIds.map((wordId) => ({
        updateOne: {
          filter: { userId: user._id, wordId },
          update: {
            $set: { status: "learning", dueDate },
            $setOnInsert: {
              _id: new ObjectId(),
              userId: user._id,
              wordId,
              easeFactor: 2.5,
              intervalDays: 0,
              repetitionCount: 0,
              lastReviewedAt: null,
              correctCount: 0,
              wrongCount: 0,
              addedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }
  await recordProgressActivity(user._id, {
    wordsLearned: objectIds.length,
    minutesStudied: step.estimatedMinutes,
  });
  return { wordsLearned: objectIds.length, timeSpentMinutes: step.estimatedMinutes };
}

async function completeGrammar(user: UserDoc, step: PlanStep, payload: unknown) {
  if (!step.topicSlug) throw new FlowError("Grammar task is missing topic", 400);
  const score = isRecord(payload) && typeof payload.score === "number" ? Math.max(0, Math.min(100, payload.score)) : 0;
  const topic = await (await grammarTopicsColl()).findOne({ slug: step.topicSlug, isPublished: true });
  if (!topic) throw new FlowError("Grammar lesson not found", 404);
  const now = new Date();
  const existing = await (await userGrammarProgressColl()).findOne({ userId: user._id, topicId: topic._id });
  await (await userGrammarProgressColl()).updateOne(
    { userId: user._id, topicId: topic._id },
    {
      $set: {
        topicSlug: topic.slug,
        status: score >= 70 ? "completed" : "needs_review",
        score,
        lastStudiedAt: now,
        completedAt: score >= 70 ? now : null,
      },
      $setOnInsert: { _id: new ObjectId(), userId: user._id, topicId: topic._id },
      $inc: { attempts: 1 },
    },
    { upsert: true }
  );
  await recordProgressActivity(user._id, {
    grammarCompleted: existing?.status === "completed" || score < 70 ? 0 : 1,
    correctAnswers: Math.round(score / 10),
    totalAnswers: 10,
    minutesStudied: step.estimatedMinutes,
  });
  return {
    correctAnswers: Math.round(score / 10),
    totalAnswers: 10,
    accuracy: score,
    timeSpentMinutes: step.estimatedMinutes,
  };
}

async function completeReading(user: UserDoc, step: PlanStep, payload: unknown) {
  if (!step.textId || !ObjectId.isValid(step.textId)) throw new FlowError("Reading task is missing text", 400);
  const answers = isRecord(payload) && isRecord(payload.answers) ? payload.answers : {};
  const textId = new ObjectId(step.textId);
  const text = await (await readingTextsColl()).findOne({ _id: textId });
  if (!text) throw new FlowError("Reading text not found", 404);
  const correctCount = text.questions.reduce((sum, question, index) => {
    return sum + (Number(answers[String(index)]) === question.answer ? 1 : 0);
  }, 0);
  const total = text.questions.length;
  const score = total ? Math.round((correctCount / total) * 100) : 0;
  const now = new Date();
  await (await userReadingProgressColl()).updateOne(
    { userId: user._id, textId },
    {
      $set: {
        status: "completed",
        score,
        correctCount,
        questionsTotal: total,
        answers: Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, Number(value)])),
        startedAt: null,
        completedAt: now,
        updatedAt: now,
      },
      $setOnInsert: { _id: new ObjectId(), userId: user._id, textId },
    },
    { upsert: true }
  );
  await recordProgressActivity(user._id, {
    correctAnswers: correctCount,
    totalAnswers: total,
    minutesStudied: step.estimatedMinutes,
  });
  return { correctAnswers: correctCount, totalAnswers: total, accuracy: score, timeSpentMinutes: step.estimatedMinutes };
}

async function completeWriting(user: UserDoc, step: PlanStep, payload: unknown) {
  const text = isRecord(payload) && typeof payload.text === "string" ? payload.text.trim() : "";
  if (text.length < 30) throw new FlowError("Writing text is too short", 400);
  await (await userWritingSubmissionsColl()).insertOne({
    _id: new ObjectId(),
    userId: user._id,
    taskId: step.templateId && ObjectId.isValid(step.templateId) ? new ObjectId(step.templateId) : null,
    content: text,
    feedback: null,
    score: null,
    errorsCount: null,
    submittedAt: new Date(),
  });
  const minutes = Math.max(step.estimatedMinutes, Math.ceil(text.length / 120));
  await recordProgressActivity(user._id, { writingsDone: 1, minutesStudied: minutes });
  return { timeSpentMinutes: minutes };
}

async function completeTest(user: UserDoc, step: PlanStep, payload: unknown) {
  const answers = isRecord(payload) && isRecord(payload.answers) ? payload.answers : {};
  const questions = await (await placementQuestionsColl()).find({}).sort({ order: 1 }).limit(8).toArray();
  const correct = questions.reduce((sum, question) => sum + (Number(answers[question._id.toString()]) === question.answer ? 1 : 0), 0);
  const total = questions.length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  await recordProgressActivity(user._id, {
    correctAnswers: correct,
    totalAnswers: total,
    minutesStudied: step.estimatedMinutes,
  });
  return { correctAnswers: correct, totalAnswers: total, accuracy, timeSpentMinutes: step.estimatedMinutes };
}

function averageAccuracy(steps: PlanStep[]) {
  const totals = steps.reduce(
    (acc, step) => ({
      correct: acc.correct + (step.result?.correctAnswers ?? 0),
      total: acc.total + (step.result?.totalAnswers ?? 0),
    }),
    { correct: 0, total: 0 }
  );
  return totals.total ? Math.round((totals.correct / totals.total) * 100) : 0;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSrsRating(value: unknown): value is SRSRating {
  return value === "again" || value === "hard" || value === "good" || value === "easy";
}

export class FlowError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

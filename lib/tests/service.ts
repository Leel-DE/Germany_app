import { ObjectId } from "mongodb";
import { z } from "zod";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import {
  grammarTopicsColl,
  testQuestionsColl,
  testsColl,
  userGrammarProgressColl,
  userTestAttemptsColl,
  userTestResultsColl,
  usersColl,
} from "@/lib/models/collections";
import type {
  CEFRLevel,
  TestAnswer,
  TestAttemptStatus,
  TestDoc,
  TestQuestionDoc,
  TestSkill,
  TestStatus,
  TestType,
  UserDoc,
  UserTestAttemptDoc,
} from "@/lib/models/types";

export const TEST_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export const TEST_SKILLS = ["grammar", "vocabulary", "reading", "listening", "mixed"] as const;
export const TEST_TYPES = ["placement", "practice", "exam"] as const;
export const TEST_STATUSES = ["new", "completed"] as const;

export const TestFilterSchema = z.object({
  level: z.enum(TEST_LEVELS).optional(),
  skill: z.enum(TEST_SKILLS).optional(),
  type: z.enum(TEST_TYPES).optional(),
  status: z.enum(TEST_STATUSES).optional(),
});

export const StartTestSchema = z.object({
  retry: z.boolean().optional(),
});

export const AnswerSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  answer: z.union([z.number(), z.boolean(), z.string(), z.array(z.string())]),
});

export const CompleteSchema = z.object({
  attemptId: z.string(),
});

export function parseObjectId(id: string, label: string) {
  if (!ObjectId.isValid(id)) throw new TestRequestError(`Invalid ${label}`, 400);
  return new ObjectId(id);
}

export async function getTestOrThrow(testId: ObjectId) {
  const test = await (await testsColl()).findOne({ _id: testId });
  if (!test) throw new TestRequestError("Test not found", 404);
  return test;
}

export async function startTestAttempt(user: UserDoc, test: TestDoc, retry = false) {
  const attempts = await userTestAttemptsColl();
  if (!retry) {
    const existing = await attempts.findOne({ userId: user._id, testId: test._id, status: "in_progress" }, { sort: { startedAt: -1 } });
    if (existing) return existing;
  }

  const now = new Date();
  const doc: UserTestAttemptDoc = {
    _id: new ObjectId(),
    userId: user._id,
    testId: test._id,
    answers: {},
    score: null,
    correct: null,
    total: test.questionsCount,
    estimatedLevel: null,
    weakAreas: [],
    strongAreas: [],
    status: "in_progress",
    startedAt: now,
    completedAt: null,
    timeSpent: null,
  };
  await attempts.insertOne(doc);
  return doc;
}

export async function saveTestAnswer(user: UserDoc, testId: ObjectId, attemptId: ObjectId, questionId: ObjectId, answer: TestAnswer) {
  const [attempt, question] = await Promise.all([
    getAttemptOrThrow(user, testId, attemptId),
    (await testQuestionsColl()).findOne({ _id: questionId, testId }),
  ]);
  if (attempt.status === "completed") throw new TestRequestError("Attempt is already completed", 409);
  if (!question) throw new TestRequestError("Question not found", 404);

  await (await userTestAttemptsColl()).updateOne(
    { _id: attempt._id, userId: user._id, testId },
    { $set: { [`answers.${questionId.toString()}`]: normalizeAnswer(answer) } }
  );
}

export async function completeTestAttempt(user: UserDoc, test: TestDoc, attemptId: ObjectId) {
  const attempt = await getAttemptOrThrow(user, test._id, attemptId);
  if (attempt.status === "completed") return attempt;

  const questions = await getQuestions(test._id);
  const checked = questions.map((question) => ({
    question,
    userAnswer: attempt.answers[question._id.toString()],
    correct: isCorrectAnswer(attempt.answers[question._id.toString()], question.correctAnswer),
  }));
  const correct = checked.filter((item) => item.correct).length;
  const total = questions.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const estimatedLevel = estimateLevel(test, checked, score);
  const weakAreas = detectAreas(checked, false);
  const strongAreas = detectAreas(checked, true);
  const now = new Date();
  const timeSpent = Math.max(1, Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000));

  await (await userTestAttemptsColl()).updateOne(
    { _id: attempt._id, userId: user._id, testId: test._id },
    {
      $set: {
        score,
        correct,
        total,
        estimatedLevel,
        weakAreas,
        strongAreas,
        status: "completed" satisfies TestAttemptStatus,
        completedAt: now,
        timeSpent,
      },
    }
  );

  if (test.type === "placement") {
    await applyPlacementResult(user, total, correct, score, estimatedLevel, weakAreas, checked);
  }
  await markGrammarWeakAreas(user, weakAreas, score);
  await recordProgressActivity(user._id, {
    minutesStudied: Math.max(5, Math.ceil(timeSpent / 60)),
    correctAnswers: correct,
    totalAnswers: total,
  });

  return {
    ...attempt,
    score,
    correct,
    total,
    estimatedLevel,
    weakAreas,
    strongAreas,
    status: "completed" as const,
    completedAt: now,
    timeSpent,
  };
}

export async function getAttemptOrThrow(user: UserDoc, testId: ObjectId, attemptId: ObjectId) {
  const attempt = await (await userTestAttemptsColl()).findOne({ _id: attemptId, userId: user._id, testId });
  if (!attempt) throw new TestRequestError("Attempt not found", 404);
  return attempt;
}

export async function getQuestions(testId: ObjectId) {
  return (await testQuestionsColl()).find({ testId }).sort({ order: 1 }).toArray();
}

export function testDTO(test: TestDoc, bestScore: number | null = null, status: TestStatus = "new") {
  return {
    id: test._id.toString(),
    title: test.title,
    level: test.level,
    skill: test.skill,
    type: test.type,
    timeLimit: test.timeLimit,
    questionsCount: test.questionsCount,
    description: test.description,
    bestScore,
    status,
  };
}

export function questionDTO(question: TestQuestionDoc, includeCorrect = false) {
  return {
    id: question._id.toString(),
    order: question.order,
    type: question.type,
    question: question.question,
    options: question.options,
    level: question.level,
    skill: question.skill,
    topic: question.topic,
    ...(includeCorrect ? { correctAnswer: question.correctAnswer, explanation: question.explanation } : {}),
  };
}

export function attemptDTO(attempt: UserTestAttemptDoc) {
  return {
    id: attempt._id.toString(),
    testId: attempt.testId.toString(),
    answers: attempt.answers,
    score: attempt.score,
    correct: attempt.correct,
    total: attempt.total,
    estimatedLevel: attempt.estimatedLevel,
    weakAreas: attempt.weakAreas,
    strongAreas: attempt.strongAreas,
    status: attempt.status,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString() ?? null,
    timeSpent: attempt.timeSpent,
  };
}

export function reviewDTO(questions: TestQuestionDoc[], attempt: UserTestAttemptDoc) {
  return questions.map((question) => ({
    question: questionDTO(question, true),
    userAnswer: attempt.answers[question._id.toString()] ?? null,
    correct: isCorrectAnswer(attempt.answers[question._id.toString()], question.correctAnswer),
  }));
}

function estimateLevel(test: TestDoc, checked: { question: TestQuestionDoc; correct: boolean }[], score: number): CEFRLevel {
  if (test.type !== "placement") {
    if (score >= 90) return nextLevel(test.level);
    return test.level;
  }

  const byLevel = new Map<CEFRLevel, { total: number; correct: number }>();
  for (const item of checked) {
    const row = byLevel.get(item.question.level) ?? { total: 0, correct: 0 };
    row.total += 1;
    if (item.correct) row.correct += 1;
    byLevel.set(item.question.level, row);
  }

  let detected: CEFRLevel = "A1";
  for (const level of TEST_LEVELS) {
    const row = byLevel.get(level);
    if (!row || row.total === 0) continue;
    const pct = Math.round((row.correct / row.total) * 100);
    if (pct >= 75) detected = level;
  }
  const top = byLevel.get("B2");
  if (top && Math.round((top.correct / top.total) * 100) >= 90) return "B2";
  return detected;
}

function detectAreas(checked: { question: TestQuestionDoc; correct: boolean }[], strong: boolean) {
  const grouped = new Map<string, { total: number; correct: number }>();
  for (const item of checked) {
    const row = grouped.get(item.question.topic) ?? { total: 0, correct: 0 };
    row.total += 1;
    if (item.correct) row.correct += 1;
    grouped.set(item.question.topic, row);
  }
  return [...grouped.entries()]
    .filter(([, row]) => row.total > 0 && (strong ? row.correct / row.total >= 0.75 : row.correct / row.total < 0.6))
    .sort((a, b) => strong ? b[1].correct / b[1].total - a[1].correct / a[1].total : a[1].correct / a[1].total - b[1].correct / b[1].total)
    .map(([topic]) => topic)
    .slice(0, 8);
}

async function applyPlacementResult(
  user: UserDoc,
  total: number,
  correct: number,
  score: number,
  estimatedLevel: CEFRLevel,
  weakAreas: string[],
  checked: { question: TestQuestionDoc; userAnswer: TestAnswer | undefined; correct: boolean }[]
) {
  await (await usersColl()).updateOne(
    { _id: user._id },
    {
      $set: {
        currentGermanLevel: estimatedLevel,
        weakGrammarAreas: weakAreas,
        placementTestCompleted: true,
        updatedAt: new Date(),
      },
    }
  );
  await (await userTestResultsColl()).insertOne({
    _id: new ObjectId(),
    userId: user._id,
    testType: "placement",
    questionsTotal: total,
    correctCount: correct,
    score,
    detectedLevel: estimatedLevel,
    weakAreas,
    answers: checked.map((item) => ({
      questionId: item.question._id.toString(),
      selected: typeof item.userAnswer === "number" ? item.userAnswer : -1,
      correct: item.correct,
    })),
    takenAt: new Date(),
  });
}

async function markGrammarWeakAreas(user: UserDoc, weakAreas: string[], score: number) {
  if (!weakAreas.length) return;
  const topics = await (await grammarTopicsColl()).find({
    $or: weakAreas.flatMap((area) => [
      { slug: new RegExp(escapeRegex(area), "i") },
      { title_de: new RegExp(escapeRegex(area), "i") },
      { category: new RegExp(escapeRegex(area), "i") },
    ]),
  }).toArray();
  const now = new Date();
  await Promise.all(topics.map((topic) =>
    userGrammarProgressColl().then((coll) => coll.updateOne(
      { userId: user._id, topicId: topic._id },
      {
        $set: {
          topicSlug: topic.slug,
          status: "needs_review",
          score: Math.min(score, 69),
          lastStudiedAt: now,
          completedAt: null,
        },
        $setOnInsert: { _id: new ObjectId(), userId: user._id, topicId: topic._id, attempts: 0 },
      },
      { upsert: true }
    ))
  ));
}

function isCorrectAnswer(userAnswer: TestAnswer | undefined, correctAnswer: TestAnswer) {
  if (Array.isArray(correctAnswer)) {
    return Array.isArray(userAnswer) && correctAnswer.map(normalizeString).join(" ") === userAnswer.map(normalizeString).join(" ");
  }
  if (typeof correctAnswer === "number") return Number(userAnswer) === correctAnswer;
  if (typeof correctAnswer === "boolean") return Boolean(userAnswer) === correctAnswer;
  return normalizeString(userAnswer) === normalizeString(correctAnswer);
}

function normalizeAnswer(answer: TestAnswer): TestAnswer {
  if (Array.isArray(answer)) return answer.map((item) => item.trim()).filter(Boolean);
  if (typeof answer === "string") return answer.trim();
  return answer;
}

function normalizeString(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function nextLevel(level: CEFRLevel): CEFRLevel {
  if (level === "A1") return "A2";
  if (level === "A2") return "B1";
  if (level === "B1") return "B2";
  return "B2";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class TestRequestError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "TestRequestError";
  }
}

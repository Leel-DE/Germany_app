import { ObjectId, type Filter } from "mongodb";
import {
  dailyPlansColl,
  grammarTopicsColl,
  readingTextsColl,
  userVocabProgressColl,
  vocabularyColl,
  writingTasksColl,
} from "@/lib/models/collections";
import type { CEFRLevel, DailyPlanDoc, PlanStep, UserDoc, VocabularyDoc } from "@/lib/models/types";

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function detectLevel(score: number): CEFRLevel {
  if (score < 35) return "A1";
  if (score < 60) return "A2";
  if (score < 80) return "B1";
  return "B2";
}

export function scoreLevelProgress(level: CEFRLevel, target: CEFRLevel, knownWords: number): number {
  const order: CEFRLevel[] = ["A1", "A2", "B1", "B2"];
  const currentIdx = order.indexOf(level);
  const targetIdx = Math.max(order.indexOf(target), currentIdx + 1);
  const levelPart = Math.min(70, Math.max(0, (currentIdx / targetIdx) * 70));
  const vocabPart = Math.min(30, (knownWords / 1500) * 30);
  return Math.min(100, Math.round(levelPart + vocabPart));
}

export async function ensureInitialVocabulary(user: UserDoc, count = 25): Promise<void> {
  const progress = await userVocabProgressColl();
  const existing = await progress.countDocuments({ userId: user._id });
  if (existing > 0) return;

  const vocab = await vocabularyColl();
  const topicFilter = user.preferredTopics.length ? { topic: { $in: user.preferredTopics } } : {};
  let words = await vocab
    .find({ cefr_level: { $in: ["A1", "A2", user.currentGermanLevel] }, ...topicFilter })
    .sort({ frequency_rank: 1 })
    .limit(count)
    .toArray();

  if (words.length < count) {
    const ids = new Set(words.map((word) => word._id.toString()));
    const fallback = await vocab
      .find({ _id: { $nin: [...ids].map((id) => new ObjectId(id)) } })
      .sort({ frequency_rank: 1 })
      .limit(count - words.length)
      .toArray();
    words = [...words, ...fallback];
  }

  const now = new Date();
  const dueDate = todayKey(now);
  if (words.length) {
    await progress.insertMany(
      words.map((word) => ({
        _id: new ObjectId(),
        userId: user._id,
        wordId: word._id,
        status: "new" as const,
        easeFactor: 2.5,
        intervalDays: 0,
        repetitionCount: 0,
        dueDate,
        lastReviewedAt: null,
        correctCount: 0,
        wrongCount: 0,
        addedAt: now,
      })),
      { ordered: false }
    );
  }
}

export async function generateDailyPlan(user: UserDoc, date = todayKey()): Promise<DailyPlanDoc> {
  await ensureInitialVocabulary(user);

  const [progress, grammarTopics, readingTexts, writingTasks, plans] = await Promise.all([
    userVocabProgressColl(),
    grammarTopicsColl(),
    readingTextsColl(),
    writingTasksColl(),
    dailyPlansColl(),
  ]);

  const existing = await plans.findOne({ userId: user._id, planDate: date });
  if (existing) return existing;

  const due = await progress
    .find({ userId: user._id, dueDate: { $lte: date }, status: { $ne: "suspended" } })
    .limit(20)
    .toArray();

  const newWordIds = await pickNewWords(user, 5);
  const grammar = await grammarTopics.findOne({
    isPublished: true,
    cefr_level: { $in: ["A1", "A2", user.currentGermanLevel] },
    ...(user.weakGrammarAreas.length ? { slug: { $in: user.weakGrammarAreas } } : {}),
  }) ?? await grammarTopics.findOne({ isPublished: true, cefr_level: user.currentGermanLevel });
  const reading = await readingTexts.findOne({
    $or: [{ isSystem: true }, { createdBy: user._id }],
    cefr_level: { $in: ["A1", "A2", user.currentGermanLevel] },
    ...(user.preferredTopics.length ? { topic: { $in: user.preferredTopics } } : {}),
  }) ?? await readingTexts.findOne({ $or: [{ isSystem: true }, { createdBy: user._id }] });
  const writing = await writingTasks.findOne({
    ...(user.preferredTopics.length ? { topic: { $in: user.preferredTopics } } : {}),
    cefr_level: { $in: ["A1", "A2", user.currentGermanLevel] },
  }) ?? await writingTasks.findOne({});
  const focusAreas = [...new Set([...user.weakSkills, ...user.weakGrammarAreas])].slice(0, 5);

  const steps: PlanStep[] = [
    createStep(0, "vocabulary_review", `Review ${due.length || 10} vocabulary cards`, 5, {
      wordIds: due.map((item) => item.wordId.toString()),
      count: due.length || 10,
    }),
    createStep(1, "new_words", `Learn ${newWordIds.length || 5} new words`, 8, {
      wordIds: newWordIds.map(String),
      count: newWordIds.length || 5,
    }),
  ];

  if (grammar) {
    steps.push(createStep(2, "grammar", `Grammar: ${grammar.title_de}`, 10, {
      topicSlug: grammar.slug,
      topicId: grammar._id.toString(),
      focus: grammar.category,
    }));
  }

  if (reading) {
    steps.push(createStep(3, "reading", `Reading: ${reading.title}`, reading.read_time_min || 6, {
      textId: reading._id.toString(),
      topic: reading.topic,
    }));
  }

  if (writing) {
    steps.push(createStep(4, "writing", `Writing: ${writing.title}`, 10, {
      templateId: writing._id.toString(),
      topic: writing.topic,
    }));
  }

  steps.push(createStep(5, "test", "Mixed mini test", 6, { focusAreas }));

  const now = new Date();
  const plan: DailyPlanDoc = {
    _id: new ObjectId(),
    userId: user._id,
    planDate: date,
    status: "pending",
    steps,
    estimatedMinutes: steps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
    focusAreas,
    stepsCompleted: 0,
    progressPercent: 0,
    score: null,
    startedAt: null,
    completedAt: null,
    createdAt: now,
  };

  await plans.insertOne(plan);
  return plan;
}

function createStep(
  order: number,
  type: PlanStep["type"],
  label: string,
  estimatedMinutes: number,
  payload: Record<string, unknown>
): PlanStep {
  return {
    id: `${type}-${order}`,
    type,
    label,
    estimatedMinutes,
    status: "pending",
    order,
    payload,
    wordIds: Array.isArray(payload.wordIds) ? payload.wordIds.filter((item): item is string => typeof item === "string") : undefined,
    topicSlug: typeof payload.topicSlug === "string" ? payload.topicSlug : undefined,
    topicId: typeof payload.topicId === "string" ? payload.topicId : undefined,
    textId: typeof payload.textId === "string" ? payload.textId : undefined,
    templateId: typeof payload.templateId === "string" ? payload.templateId : undefined,
    count: typeof payload.count === "number" ? payload.count : undefined,
    startedAt: null,
    completedAt: null,
    result: null,
  };
}

async function pickNewWords(user: UserDoc, count: number): Promise<ObjectId[]> {
  const [progress, vocab] = await Promise.all([userVocabProgressColl(), vocabularyColl()]);
  const knownProgress = await progress.find({ userId: user._id }, { projection: { wordId: 1 } }).toArray();
  const excluded = knownProgress.map((item) => item.wordId);
  const filter: Filter<VocabularyDoc> = {
    _id: { $nin: excluded },
    cefr_level: { $in: ["A1", "A2", user.currentGermanLevel] },
  };
  if (user.preferredTopics.length) filter.topic = { $in: user.preferredTopics };

  const words = await vocab.find(filter).sort({ frequency_rank: 1 }).limit(count).toArray();
  return words.map((word) => word._id);
}

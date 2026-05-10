import { NextResponse } from "next/server";
import type { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { dailyPlanDTO } from "@/lib/data/dto";
import { generateDailyPlan, scoreLevelProgress } from "@/lib/data/personalization";
import { getCurrentRecommendation } from "@/lib/focused-practice/service";
import {
  dailyStatsColl,
  grammarTopicsColl,
  readingTextsColl,
  userGrammarProgressColl,
  userReadingProgressColl,
  userTestAttemptsColl,
  userTestResultsColl,
  userVocabProgressColl,
  userWritingProgressColl,
  userWritingSubmissionsColl,
  vocabularyColl,
  writingTasksColl,
} from "@/lib/models/collections";
import type { PlanStepType, VocabularyDoc } from "@/lib/models/types";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const userId = auth.user._id;
  const today = new Date().toISOString().slice(0, 10);

  const [
    plan,
    vocabProgress,
    vocabularyTotal,
    grammarTotal,
    grammarProgress,
    readingTotal,
    readingCompleted,
    writingTasksTotal,
    writingProgress,
    writingSubmissions,
    latestTestAttempt,
    stats,
    latestPlacement,
  ] = await Promise.all([
    generateDailyPlan(auth.user),
    (await userVocabProgressColl()).find({ userId }).toArray(),
    (await vocabularyColl()).countDocuments(visibleSystemOrUserFilter(userId)),
    (await grammarTopicsColl()).countDocuments({ isPublished: true }),
    (await userGrammarProgressColl()).find({ userId }).toArray(),
    (await readingTextsColl()).countDocuments(visibleSystemOrUserFilter(userId)),
    (await userReadingProgressColl()).countDocuments({ userId, status: "completed" }),
    (await writingTasksColl()).countDocuments({}),
    (await userWritingProgressColl()).find({ userId }).toArray(),
    (await userWritingSubmissionsColl()).find({ userId, createdAt: { $exists: true } }).sort({ createdAt: -1 }).limit(20).toArray(),
    (await userTestAttemptsColl()).findOne({ userId, status: "completed" }, { sort: { completedAt: -1 } }),
    (await dailyStatsColl()).find({ userId }).sort({ date: -1 }).limit(30).toArray(),
    (await userTestResultsColl()).findOne({ userId }, { sort: { takenAt: -1 } }),
  ]);

  const knownWords = vocabProgress.filter((row) => row.status === "known" || row.status === "review").length;
  const dueReviews = vocabProgress.filter((row) => row.dueDate <= today && row.status !== "suspended").length;
  const grammarCompleted = grammarProgress.filter((row) => row.status === "completed").length;
  const writingCompleted = writingProgress.filter((row) => row.status === "completed").length;
  const lastWritingScore = writingSubmissions[0]?.score ?? null;
  const accuracyTotals = stats.reduce(
    (acc, row) => ({
      correct: acc.correct + row.correctAnswers,
      total: acc.total + row.totalAnswers,
      wordsLearned: acc.wordsLearned + row.wordsLearned,
      grammarCompleted: acc.grammarCompleted + row.grammarCompleted,
    }),
    { correct: 0, total: 0, wordsLearned: 0, grammarCompleted: 0 }
  );
  const avgAccuracy = accuracyTotals.total ? Math.round((accuracyTotals.correct / accuracyTotals.total) * 100) : 0;
  const weakAreas = await buildWeakAreas(userId, grammarProgress, vocabProgress, [
    ...auth.user.weakGrammarAreas,
    ...(latestPlacement?.weakAreas ?? []),
    ...(latestTestAttempt?.weakAreas ?? []),
    ...writingSubmissions.flatMap((row) => row.weakAreas),
  ]);
  const currentRecommendation = await getCurrentRecommendation(auth.user);
  const lastActivity = await buildLastActivity(userId);
  const planDto = dailyPlanDTO(plan);
  const planSteps = planDto.steps.map((step, index: number) => ({
    type: step.type,
    title: step.label,
    estimate_minutes: step.estimatedMinutes,
    status: step.completed || index < plan.stepsCompleted ? "done" : "pending",
    href: stepHref(step),
  }));

  return NextResponse.json({
    user: {
      id: userId.toString(),
      name: auth.user.name,
      current_level: auth.user.currentGermanLevel,
      target_level: auth.user.targetGermanLevel,
      minutes_per_day: auth.user.dailyStudyMinutes,
      streak_days: auth.user.streakCount ?? 0,
      profession: auth.user.profession ?? null,
    },
    progress: [
      progressItem("Vocabulary", knownWords, vocabularyTotal, "words", "/vocabulary"),
      progressItem("Grammar", grammarCompleted, grammarTotal, "lessons", "/grammar"),
      progressItem("Reading", readingCompleted, readingTotal, "texts", "/reading"),
      progressItem("Writing", writingCompleted, writingTasksTotal, "tasks", "/writing"),
      progressItem("Listening", 0, 0, "sessions", "/listening"),
      progressItem("Speaking", 0, 0, "sessions", "/speaking"),
    ],
    today_plan: {
      id: planDto.id,
      date: planDto.plan_date,
      status: planDto.status,
      estimated_minutes: planDto.estimated_minutes,
      completed: plan.stepsCompleted,
      total: plan.steps.length,
      progress_percent: percent(plan.stepsCompleted, plan.steps.length),
      steps: planSteps,
    },
    stats: {
      words_learned: knownWords,
      due_reviews: dueReviews,
      grammar_completed: grammarCompleted,
      reading_completed: readingCompleted,
      writing_submissions: writingCompleted,
      last_writing_score: lastWritingScore,
      last_test_score: latestTestAttempt?.score ?? null,
      accuracy_percent: avgAccuracy,
      level_progress_percent: scoreLevelProgress(auth.user.currentGermanLevel, auth.user.targetGermanLevel, knownWords),
    },
    weak_areas: weakAreas,
    recommendation: {
      title: "Recommended for you",
      text: currentRecommendation.message,
      cta: currentRecommendation.ctaLabel,
      target: currentRecommendation.target,
    },
    last_activity: lastActivity,
  });
}

function progressItem(label: string, current: number, target: number, unit: string, href: string) {
  return {
    label,
    current,
    target,
    unit,
    progress_percent: percent(current, target),
    href,
    empty: target === 0,
  };
}

function percent(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function visibleSystemOrUserFilter(userId: ObjectId) {
  return { $or: [{ isSystem: true }, { createdBy: userId }] };
}

async function buildWeakAreas(
  userId: ObjectId,
  grammarProgress: { topicId: ObjectId; topicSlug: string; score: number | null; status: string }[],
  vocabProgress: { wordId: ObjectId; correctCount: number; wrongCount: number }[],
  savedGrammarAreas: string[]
) {
  const grammarWeakProgress = grammarProgress
    .filter((row) => row.status === "needs_review" || (typeof row.score === "number" && row.score < 70))
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 5);

  const grammarTopics = grammarWeakProgress.length
    ? await (await grammarTopicsColl()).find({ _id: { $in: grammarWeakProgress.map((row) => row.topicId) } }).toArray()
    : [];
  const titleById = new Map(grammarTopics.map((topic) => [topic._id.toString(), topic.title_de]));

  const weakAreas = new Map<string, {
    type: "grammar" | "vocabulary";
    slug: string;
    title: string;
    confidence: number;
    source: string;
    href: string;
  }>();

  for (const row of grammarWeakProgress) {
    weakAreas.set(`grammar:${row.topicSlug}`, {
      type: "grammar",
      slug: row.topicSlug,
      title: titleById.get(row.topicId.toString()) ?? row.topicSlug,
      confidence: Math.max(0, Math.min(100, row.score ?? 0)),
      source: "grammar progress",
      href: `/grammar/${row.topicSlug}`,
    });
  }

  for (const slug of savedGrammarAreas.filter(Boolean).slice(0, 5)) {
    const key = `grammar:${slug}`;
    if (!weakAreas.has(key)) {
      const isGrammar = ["akkusativ", "dativ", "artikel", "nominativ", "perfekt", "wortstellung"].some((item) =>
        slug.toLowerCase().includes(item)
      );
      weakAreas.set(key, {
        type: isGrammar ? "grammar" : "vocabulary",
        slug,
        title: slug,
        confidence: 0,
        source: isGrammar ? "placement test" : "profile topic",
        href: isGrammar ? `/grammar/${slug}` : `/vocabulary?topic=${encodeURIComponent(slug)}`,
      });
    }
  }

  const weakWordRows = vocabProgress.filter((row) => row.wrongCount > 0 && row.wrongCount >= row.correctCount);
  if (weakWordRows.length) {
    const words = await (await vocabularyColl())
      .find({ _id: { $in: weakWordRows.map((row) => row.wordId) }, ...visibleSystemOrUserFilter(userId) })
      .project<Pick<VocabularyDoc, "_id" | "topic">>({ _id: 1, topic: 1 })
      .toArray();
    const topicByWord = new Map(words.map((word) => [word._id.toString(), word.topic ?? "Vocabulary"]));
    const topicStats = new Map<string, { correct: number; wrong: number }>();
    for (const row of weakWordRows) {
      const topic = topicByWord.get(row.wordId.toString());
      if (!topic) continue;
      const current = topicStats.get(topic) ?? { correct: 0, wrong: 0 };
      current.correct += row.correctCount;
      current.wrong += row.wrongCount;
      topicStats.set(topic, current);
    }
    [...topicStats.entries()]
      .sort((a, b) => b[1].wrong - a[1].wrong)
      .slice(0, 4)
      .forEach(([topic, stat]) => {
        const total = stat.correct + stat.wrong;
        weakAreas.set(`vocabulary:${topic}`, {
          type: "vocabulary",
          slug: topic,
          title: topic,
          confidence: total ? Math.round((stat.correct / total) * 100) : 0,
          source: "vocabulary reviews",
          href: `/vocabulary?topic=${encodeURIComponent(topic)}`,
        });
      });
  }

  return [...weakAreas.values()].sort((a, b) => a.confidence - b.confidence).slice(0, 6);
}

async function buildLastActivity(userId: ObjectId) {
  const [vocabRows, grammarRows, readingRows, writingRows] = await Promise.all([
    (await userVocabProgressColl()).find({ userId }).sort({ addedAt: -1 }).limit(5).toArray(),
    (await userGrammarProgressColl()).find({ userId, status: "completed" }).sort({ completedAt: -1 }).limit(5).toArray(),
    (await userReadingProgressColl()).find({ userId, status: "completed" }).sort({ completedAt: -1 }).limit(5).toArray(),
    (await userWritingSubmissionsColl()).find({ userId, createdAt: { $exists: true } }).sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  const [words, grammarTopics, readingTexts] = await Promise.all([
    vocabRows.length ? (await vocabularyColl()).find({ _id: { $in: vocabRows.map((row) => row.wordId) } }).toArray() : [],
    grammarRows.length ? (await grammarTopicsColl()).find({ _id: { $in: grammarRows.map((row) => row.topicId) } }).toArray() : [],
    readingRows.length ? (await readingTextsColl()).find({ _id: { $in: readingRows.map((row) => row.textId) } }).toArray() : [],
  ]);

  const wordById = new Map(words.map((word) => [word._id.toString(), word.german]));
  const grammarById = new Map(grammarTopics.map((topic) => [topic._id.toString(), topic.title_de]));
  const readingById = new Map(readingTexts.map((text) => [text._id.toString(), text.title]));
  const items = [
    ...vocabRows.map((row) => ({
      type: "Added words",
      title: wordById.get(row.wordId.toString()) ?? "Vocabulary item",
      occurred_at: row.addedAt.toISOString(),
      href: `/vocabulary/${row.wordId.toString()}`,
    })),
    ...grammarRows.map((row) => ({
      type: "Completed grammar",
      title: grammarById.get(row.topicId.toString()) ?? row.topicSlug,
      occurred_at: (row.completedAt ?? row.lastStudiedAt ?? new Date(0)).toISOString(),
      href: `/grammar/${row.topicSlug}`,
    })),
    ...readingRows.map((row) => ({
      type: "Finished reading",
      title: readingById.get(row.textId.toString()) ?? "Reading text",
      occurred_at: (row.completedAt ?? row.updatedAt).toISOString(),
      href: `/reading/${row.textId.toString()}`,
    })),
    ...writingRows.map((row) => ({
      type: "Submitted writing",
      title: "Writing submission",
      occurred_at: row.createdAt.toISOString(),
      href: `/writing/${row.taskId.toString()}`,
    })),
  ];

  return items.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).slice(0, 5);
}

function stepHref(step: { type: PlanStepType; topicSlug?: string }) {
  if (step.type === "vocabulary_review") return "/srs";
  if (step.type === "new_words") return "/vocabulary";
  if (step.type === "grammar" && step.topicSlug) return `/grammar/${step.topicSlug}`;
  if (step.type === "reading") return "/reading";
  if (step.type === "writing") return "/writing";
  if (step.type === "test") return "/tests";
  return "/daily-plan";
}

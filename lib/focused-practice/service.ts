import { ObjectId } from "mongodb";
import {
  dailyPlansColl,
  focusedPracticeSessionsColl,
  grammarTopicsColl,
  readingTextsColl,
  userGrammarProgressColl,
  userReadingProgressColl,
  userTestResultsColl,
  userVocabProgressColl,
  vocabularyColl,
} from "@/lib/models/collections";
import type {
  FocusedPracticeSessionDoc,
  FocusedPracticeTask,
  FocusedPracticeType,
  GrammarTopicDoc,
  ReadingTextDoc,
  UserDoc,
  VocabularyDoc,
} from "@/lib/models/types";
import { recordProgressActivity } from "@/lib/data/progressTracking";

export const TOPIC_MAP: Record<string, {
  type: "grammar" | "vocabulary";
  label: string;
  practiceType: FocusedPracticeType;
  lessonSlug?: string;
}> = {
  alltag: {
    type: "vocabulary",
    label: "Alltag",
    practiceType: "mixed",
  },
  akkusativ: {
    type: "grammar",
    label: "Akkusativ",
    practiceType: "grammar",
    lessonSlug: "der-akkusativ",
  },
  dativ: {
    type: "grammar",
    label: "Dativ",
    practiceType: "grammar",
    lessonSlug: "der-dativ",
  },
  artikel: {
    type: "grammar",
    label: "Artikel",
    practiceType: "grammar",
  },
};

export interface CurrentRecommendation {
  weakArea: string;
  weakAreaType: FocusedPracticeType;
  message: string;
  ctaLabel: string;
  target: {
    type: "focused_practice";
    topic: string;
    practiceType: FocusedPracticeType;
  };
}

export async function getCurrentRecommendation(user: UserDoc): Promise<CurrentRecommendation> {
  const [grammarProgress, vocabProgress, readingProgress, placement, recentPlan] = await Promise.all([
    (await userGrammarProgressColl()).find({ userId: user._id }).toArray(),
    (await userVocabProgressColl()).find({ userId: user._id }).toArray(),
    (await userReadingProgressColl()).find({ userId: user._id }).sort({ updatedAt: -1 }).limit(10).toArray(),
    (await userTestResultsColl()).findOne({ userId: user._id }, { sort: { takenAt: -1 } }),
    (await dailyPlansColl()).findOne({ userId: user._id }, { sort: { createdAt: -1 } }),
  ]);

  const weakGrammar = grammarProgress
    .filter((row) => row.status === "needs_review" || (typeof row.score === "number" && row.score < 70))
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (weakGrammar?.topicSlug) return recommendationFromTopic(weakGrammar.topicSlug, "grammar", weakGrammar.score ?? 0);

  const weakVocab = vocabProgress
    .filter((row) => row.wrongCount > 0 && row.wrongCount >= row.correctCount)
    .sort((a, b) => b.wrongCount - a.wrongCount)[0];
  if (weakVocab) {
    const word = await (await vocabularyColl()).findOne({ _id: weakVocab.wordId });
    if (word?.topic) return recommendationFromTopic(word.topic, "vocabulary", confidence(weakVocab.correctCount, weakVocab.wrongCount));
  }

  const weakReading = readingProgress.filter((row) => row.score < 70).sort((a, b) => a.score - b.score)[0];
  if (weakReading) {
    const text = await (await readingTextsColl()).findOne({ _id: weakReading.textId });
    if (text?.topic) return recommendationFromTopic(text.topic, "reading", text ? weakReading.score : 0);
  }

  const placementArea = placement?.weakAreas?.[0];
  if (placementArea) return recommendationFromTopic(placementArea, inferType(placementArea), 0);

  const planArea = recentPlan?.focusAreas?.[0];
  if (planArea) return recommendationFromTopic(planArea, inferType(planArea), 0);

  const onboardingArea = user.weakGrammarAreas[0] ?? user.preferredTopics[0] ?? "akkusativ";
  return recommendationFromTopic(onboardingArea, inferType(onboardingArea), 0);
}

export async function startFocusedPractice(user: UserDoc, topicInput: string, typeInput?: FocusedPracticeType) {
  const topic = normalizeTopic(topicInput || "akkusativ");
  const mapped = mapTopic(topic);
  const type = typeInput ?? mapped.practiceType;
  const tasks = await buildPracticeTasks(user, topic, type);
  const now = new Date();
  const session: FocusedPracticeSessionDoc = {
    _id: new ObjectId(),
    userId: user._id,
    topic,
    type,
    status: "in_progress",
    tasks: tasks.slice(0, 10),
    score: null,
    mistakes: [],
    startedAt: now,
    completedAt: null,
    createdAt: now,
  };

  await (await focusedPracticeSessionsColl()).insertOne(session);
  return {
    session,
    redirectUrl: `/focused-practice/${session._id.toString()}`,
  };
}

export async function getFocusedPracticeSession(user: UserDoc, sessionId: string) {
  if (!ObjectId.isValid(sessionId)) return null;
  return (await focusedPracticeSessionsColl()).findOne({ _id: new ObjectId(sessionId), userId: user._id });
}

export async function completeFocusedPractice(user: UserDoc, session: FocusedPracticeSessionDoc, answers: Record<string, string | number>) {
  if (session.status === "completed") return session;

  const tasks = session.tasks.map((task) => {
    const userAnswer = answers[task.id] ?? null;
    return { ...task, userAnswer };
  });
  const mistakes = tasks
    .filter((task) => !sameAnswer(task.userAnswer, task.correctAnswer))
    .map((task) => task.question);
  const correct = tasks.length - mistakes.length;
  const score = tasks.length ? Math.round((correct / tasks.length) * 100) : 0;
  const now = new Date();

  await (await focusedPracticeSessionsColl()).updateOne(
    { _id: session._id, userId: user._id },
    {
      $set: {
        tasks,
        mistakes,
        score,
        status: "completed",
        completedAt: now,
      },
    }
  );

  if (session.type === "grammar" && score < 70) {
    const lessonSlug = mapTopic(session.topic).lessonSlug ?? session.topic;
    const lesson = await findGrammarTopic(session.topic, lessonSlug);
    if (lesson) {
      await (await userGrammarProgressColl()).updateOne(
        { userId: user._id, topicId: lesson._id },
        {
          $set: {
            topicSlug: lesson.slug,
            status: "needs_review",
            score,
            lastStudiedAt: now,
            completedAt: null,
          },
          $setOnInsert: { _id: new ObjectId(), userId: user._id, topicId: lesson._id, attempts: 0 },
          $inc: { attempts: 1 },
        },
        { upsert: true }
      );
    }
  }

  await recordProgressActivity(user._id, {
    minutesStudied: Math.max(5, Math.ceil(tasks.length * 1.5)),
    correctAnswers: correct,
    totalAnswers: tasks.length,
  });

  return {
    ...session,
    tasks,
    mistakes,
    score,
    status: "completed" as const,
    completedAt: now,
  };
}

export function focusedPracticeDTO(session: FocusedPracticeSessionDoc) {
  return {
    id: session._id.toString(),
    topic: session.topic,
    type: session.type,
    status: session.status,
    score: session.score,
    mistakes: session.mistakes,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    tasks: session.tasks,
  };
}

function recommendationFromTopic(topicInput: string, typeInput: FocusedPracticeType, score: number): CurrentRecommendation {
  const topic = normalizeTopic(topicInput);
  const mapped = mapTopic(topic);
  const practiceType = typeInput === "grammar" || typeInput === "vocabulary" || typeInput === "reading"
    ? typeInput
    : mapped.practiceType;
  const label = mapped.label;
  const weakAreaType = practiceType === "mixed" ? mapped.practiceType : practiceType;
  const detail = weakAreaType === "grammar"
    ? `You make frequent mistakes with ${label}. Focus on forms and sentence patterns today.`
    : weakAreaType === "vocabulary"
      ? `Your vocabulary reviews show weak confidence in ${label}. Practice meanings and usage today.`
      : weakAreaType === "reading"
        ? `Your reading score is low for ${label}. Practice comprehension with focused questions.`
        : `Your weak area is ${label}. Practice grammar, vocabulary, and reading together today.`;

  return {
    weakArea: label,
    weakAreaType,
    message: score > 0 ? `${detail} Current confidence: ${score}%.` : detail,
    ctaLabel: "Start focused practice",
    target: {
      type: "focused_practice",
      topic,
      practiceType: weakAreaType,
    },
  };
}

async function buildPracticeTasks(user: UserDoc, topic: string, type: FocusedPracticeType): Promise<FocusedPracticeTask[]> {
  if (type === "grammar") return ensureEnough(await grammarTasks(topic), () => fallbackGrammarTasks(topic));
  if (type === "vocabulary") return ensureEnough(await vocabularyTasks(user, topic), () => fallbackVocabularyTasks(topic));
  if (type === "reading") return ensureEnough(await readingTasks(user, topic), () => fallbackReadingTasks(topic));

  const [grammar, vocab, reading] = await Promise.all([
    grammarTasks(topic),
    vocabularyTasks(user, topic),
    readingTasks(user, topic),
  ]);
  return ensureEnough(
    [...grammar.slice(0, 2), ...vocab.slice(0, 2), ...reading.slice(0, 1)],
    () => [...fallbackGrammarTasks(topic).slice(0, 2), ...fallbackVocabularyTasks(topic).slice(0, 2), ...fallbackReadingTasks(topic).slice(0, 1)]
  );
}

async function grammarTasks(topic: string): Promise<FocusedPracticeTask[]> {
  const mapped = mapTopic(topic);
  const lesson = await findGrammarTopic(topic, mapped.lessonSlug);
  if (!lesson) return [];

  const miniTest = lesson.mini_test.slice(0, 4).map((question, index): FocusedPracticeTask => ({
    id: `grammar-${lesson._id.toString()}-${index}`,
    taskType: "multiple_choice",
    question: question.question,
    options: question.options,
    correctAnswer: question.answer,
    explanation: question.explanation,
    sourceType: "grammar",
    sourceId: lesson._id.toString(),
  }));
  const exercises = lesson.exercises.slice(0, 3).map((exercise, index): FocusedPracticeTask => {
    const options = exercise.options?.length ? exercise.options : [String(exercise.answer), "der", "die", "das"].slice(0, 4);
    return {
      id: `exercise-${lesson._id.toString()}-${index}`,
      taskType: exercise.type === "reorder" ? "sentence_order" : exercise.type === "fill_blank" ? "fill_blank" : "multiple_choice",
      question: exercise.question ?? exercise.sentence ?? `Practice ${lesson.title_de}`,
      options,
      correctAnswer: typeof exercise.answer === "number" ? exercise.answer : String(exercise.answer),
      explanation: exercise.explanation ?? lesson.content.typical_errors[0] ?? lesson.content.explanation,
      sourceType: "grammar",
      sourceId: lesson._id.toString(),
    };
  });
  return [...miniTest, ...exercises];
}

async function vocabularyTasks(user: UserDoc, topic: string): Promise<FocusedPracticeTask[]> {
  const query = buildTopicRegex(topic);
  const weakProgress = await (await userVocabProgressColl())
    .find({ userId: user._id, wrongCount: { $gt: 0 } })
    .sort({ wrongCount: -1 })
    .limit(20)
    .toArray();
  const weakIds = weakProgress.map((row) => row.wordId);
  const words = await (await vocabularyColl())
    .find({
      $and: [
        { $or: [{ isSystem: true }, { createdBy: user._id }] },
        weakIds.length ? { $or: [{ _id: { $in: weakIds } }, { topic: query }] } : { topic: query },
      ],
    })
    .sort({ frequency_rank: 1 })
    .limit(8)
    .toArray();

  return words.flatMap((word, index) => vocabularyWordTasks(word, index)).slice(0, 8);
}

async function readingTasks(user: UserDoc, topic: string): Promise<FocusedPracticeTask[]> {
  const text = await (await readingTextsColl()).findOne({
    $or: [{ isSystem: true }, { createdBy: user._id }],
    topic: buildTopicRegex(topic),
  }) ?? await (await readingTextsColl()).findOne({ $or: [{ isSystem: true }, { createdBy: user._id }] });
  if (!text) return [];
  return readingTextTasks(text);
}

function vocabularyWordTasks(word: VocabularyDoc, index: number): FocusedPracticeTask[] {
  const options = [word.translation_ru, "case/matter", "letter", "time"].filter(Boolean).slice(0, 4);
  const tasks: FocusedPracticeTask[] = [{
    id: `vocab-meaning-${word._id.toString()}-${index}`,
    taskType: "multiple_choice",
    question: `Choose the correct meaning: ${word.article ? `${word.article} ` : ""}${word.german}`,
    options,
    correctAnswer: 0,
    explanation: word.example_ru ?? word.translation_ru,
    sourceType: "vocabulary",
    sourceId: word._id.toString(),
  }];
  if (word.article) {
    tasks.push({
      id: `vocab-article-${word._id.toString()}-${index}`,
      taskType: "multiple_choice",
      question: `Choose the correct article for ${word.german}`,
      options: ["der", "die", "das"],
      correctAnswer: ["der", "die", "das"].indexOf(word.article),
      explanation: `${word.article} ${word.german}`,
      sourceType: "vocabulary",
      sourceId: word._id.toString(),
    });
  }
  return tasks;
}

function readingTextTasks(text: ReadingTextDoc): FocusedPracticeTask[] {
  return text.questions.slice(0, 5).map((question, index) => ({
    id: `reading-${text._id.toString()}-${index}`,
    taskType: "multiple_choice",
    question: `${text.title}: ${question.question}`,
    options: question.options,
    correctAnswer: question.answer,
    explanation: question.explanation,
    sourceType: "reading",
    sourceId: text._id.toString(),
  }));
}

async function findGrammarTopic(topic: string, lessonSlug?: string): Promise<GrammarTopicDoc | null> {
  const candidates = [lessonSlug, topic, normalizeTopic(topic)].filter((item): item is string => Boolean(item));
  return (await grammarTopicsColl()).findOne({
    isPublished: true,
    $or: [
      { slug: { $in: candidates } },
      { category: buildTopicRegex(topic) },
      { title_de: buildTopicRegex(topic) },
      { title_ru: buildTopicRegex(topic) },
    ],
  });
}

function fallbackGrammarTasks(topic: string): FocusedPracticeTask[] {
  const mapped = mapTopic(topic);
  const label = mapped.label;
  if (normalizeTopic(topic).includes("dativ")) {
    return [
      fallbackChoice("grammar-fallback-1", "Choose the Dativ form: Ich helfe ___ Mann.", ["der", "dem", "den", "die"], 1, "helfen takes Dativ: dem Mann."),
      fallbackChoice("grammar-fallback-2", "Choose the correct article: mit ___ Freundin", ["die", "der", "den", "das"], 1, "mit takes Dativ: mit der Freundin."),
      fallbackFill("grammar-fallback-3", "Fill the blank: Ich fahre mit ___ Bus.", "dem", "mit takes Dativ: mit dem Bus."),
    ];
  }
  return [
    fallbackChoice("grammar-fallback-1", `Choose the correct ${label} form: Ich sehe ___ Mann.`, ["der", "dem", "den", "die"], 2, "sehen takes Akkusativ: den Mann."),
    fallbackChoice("grammar-fallback-2", "Choose the object form: Ich kaufe ___ Kaffee.", ["ein", "einen", "einem", "eine"], 1, "Masculine Akkusativ changes ein to einen."),
    fallbackFill("grammar-fallback-3", "Fill the blank: Sie hat ___ Termin.", "einen", "Termin is masculine; in Akkusativ: einen Termin."),
    fallbackChoice("grammar-fallback-4", "Which sentence is correct?", ["Ich brauche der Ausweis.", "Ich brauche den Ausweis.", "Ich brauche dem Ausweis."], 1, "brauchen takes Akkusativ."),
    fallbackChoice("grammar-fallback-5", "Choose the correct article: Ich finde ___ Wohnung gut.", ["der", "die", "den", "dem"], 1, "Wohnung is feminine; Akkusativ remains die."),
  ];
}

function fallbackVocabularyTasks(topic: string): FocusedPracticeTask[] {
  const label = mapTopic(topic).label;
  return [
    fallbackChoice("vocab-fallback-1", `What does "${label === "Alltag" ? "der Termin" : "die Arbeit"}" mean?`, ["appointment", "food", "weather", "key"], 0, "der Termin means appointment."),
    fallbackChoice("vocab-fallback-2", "Choose the correct article for Wohnung.", ["der", "die", "das"], 1, "die Wohnung."),
    fallbackFill("vocab-fallback-3", "Translate: appointment", "der Termin", "A common Alltag word is der Termin."),
    fallbackChoice("vocab-fallback-4", "Choose the meaning of bezahlen.", ["to pay", "to read", "to wait", "to sleep"], 0, "bezahlen means to pay."),
    fallbackChoice("vocab-fallback-5", "Choose the correct article for Arzt.", ["der", "die", "das"], 0, "der Arzt."),
  ];
}

function fallbackReadingTasks(topic: string): FocusedPracticeTask[] {
  const label = mapTopic(topic).label;
  return [
    fallbackChoice(
      "reading-fallback-1",
      `Short text: Anna hat morgen einen Termin beim Buergeramt. Was hat Anna morgen?`,
      ["einen Termin", "Urlaub", "eine Prufung", "einen Kurs"],
      0,
      `This checks basic comprehension for ${label}.`
    ),
  ];
}

function fallbackChoice(id: string, question: string, options: string[], correctAnswer: number, explanation: string): FocusedPracticeTask {
  return { id, taskType: "multiple_choice", question, options, correctAnswer, explanation, sourceType: "fallback" };
}

function fallbackFill(id: string, question: string, correctAnswer: string, explanation: string): FocusedPracticeTask {
  return { id, taskType: "fill_blank", question, options: [], correctAnswer, explanation, sourceType: "fallback" };
}

function ensureEnough(tasks: FocusedPracticeTask[], fallback: () => FocusedPracticeTask[]) {
  const unique = new Map<string, FocusedPracticeTask>();
  [...tasks, ...fallback()].forEach((task) => unique.set(task.id, task));
  return [...unique.values()].slice(0, 10);
}

function mapTopic(topic: string) {
  return TOPIC_MAP[normalizeTopic(topic)] ?? {
    type: inferType(topic) === "grammar" ? "grammar" as const : "vocabulary" as const,
    label: titleCase(topic),
    practiceType: inferType(topic),
  };
}

function normalizeTopic(value: string) {
  return value.trim().toLowerCase().replace(/^der-|^die-|^das-/, "").replace(/\s+/g, "-");
}

function inferType(topic: string): FocusedPracticeType {
  const normalized = normalizeTopic(topic);
  if (["akkusativ", "dativ", "artikel", "nominativ", "perfekt", "wortstellung"].some((item) => normalized.includes(item))) {
    return "grammar";
  }
  if (["lesen", "reading"].some((item) => normalized.includes(item))) return "reading";
  return TOPIC_MAP[normalized]?.practiceType ?? "mixed";
}

function confidence(correct: number, wrong: number) {
  const total = correct + wrong;
  return total ? Math.round((correct / total) * 100) : 0;
}

function buildTopicRegex(topic: string) {
  return new RegExp(escapeRegex(topic.replace(/-/g, " ")), "i");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function sameAnswer(userAnswer: string | number | null | undefined, correctAnswer: string | number) {
  if (typeof correctAnswer === "number") return Number(userAnswer) === correctAnswer;
  return String(userAnswer ?? "").trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
}

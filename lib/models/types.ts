import type { ObjectId } from "mongodb";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2";
export type WordType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "preposition"
  | "conjunction";
export type WordStatus = "new" | "learning" | "review" | "known" | "suspended";
export type SRSRating = "again" | "hard" | "good" | "easy";

// ─── USER ───────────────────────────────────────────────────────────────────
export interface UserDoc {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  nativeLanguage: string;
  currentGermanLevel: CEFRLevel;
  targetGermanLevel: CEFRLevel;
  learningGoals: string[]; // e.g. ["Leben in DE","Arbeit"]
  profession?: string;
  studyPurpose?: string;
  dailyStudyMinutes: number; // 5–60
  studyDaysPerWeek: number; // 1–7
  preferredFormats: string[]; // ["flashcards","grammar",…]
  preferredTopics: string[]; // ["Alltag","Arbeit",…]
  weakSkills: string[]; // ["grammar","listening",…]
  weakGrammarAreas: string[]; // ["akkusativ",…] from placement test
  onboardingCompleted: boolean;
  placementTestCompleted: boolean;
  streakCount: number;
  streakLastDate: string | null; // YYYY-MM-DD
  totalStudyDays: number;
  interfaceTheme: "light" | "dark" | "system";
  createdAt: Date;
  updatedAt: Date;
}

// Public, safe-to-expose user
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  nativeLanguage: string;
  currentGermanLevel: CEFRLevel;
  targetGermanLevel: CEFRLevel;
  learningGoals: string[];
  profession?: string;
  studyPurpose?: string;
  dailyStudyMinutes: number;
  studyDaysPerWeek: number;
  preferredFormats: string[];
  preferredTopics: string[];
  weakSkills: string[];
  weakGrammarAreas: string[];
  onboardingCompleted: boolean;
  placementTestCompleted: boolean;
  streakCount: number;
  streakLastDate: string | null;
  totalStudyDays: number;
  interfaceTheme: "light" | "dark" | "system";
}

export function toPublicUser(u: UserDoc): PublicUser {
  return {
    id: u._id.toString(),
    email: u.email,
    name: u.name,
    nativeLanguage: u.nativeLanguage,
    currentGermanLevel: u.currentGermanLevel,
    targetGermanLevel: u.targetGermanLevel,
    learningGoals: u.learningGoals ?? [],
    profession: u.profession,
    studyPurpose: u.studyPurpose,
    dailyStudyMinutes: u.dailyStudyMinutes,
    studyDaysPerWeek: u.studyDaysPerWeek,
    preferredFormats: u.preferredFormats ?? [],
    preferredTopics: u.preferredTopics ?? [],
    weakSkills: u.weakSkills ?? [],
    weakGrammarAreas: u.weakGrammarAreas ?? [],
    onboardingCompleted: u.onboardingCompleted,
    placementTestCompleted: u.placementTestCompleted,
    streakCount: u.streakCount ?? 0,
    streakLastDate: u.streakLastDate ?? null,
    totalStudyDays: u.totalStudyDays ?? 0,
    interfaceTheme: u.interfaceTheme ?? "system",
  };
}

// ─── VOCABULARY ─────────────────────────────────────────────────────────────
export interface VocabularyDoc {
  _id: ObjectId;
  german: string;
  translation_ru: string;
  translation_en?: string;
  article?: string; // der/die/das
  plural?: string;
  word_type: WordType;
  cefr_level: CEFRLevel;
  topic?: string;
  frequency_rank?: number;
  example_de?: string;
  example_ru?: string;
  notes?: string;
  grammarInfo?: string;
  frequencyLevel?: "low" | "medium" | "high";
  // Verb-specific
  verb?: {
    infinitive: string;
    praesens_ich?: string;
    praesens_du?: string;
    praesens_er?: string;
    praeteritum?: string;
    perfekt?: string;
    partizip_2?: string;
    hilfsverb?: "haben" | "sein";
    is_trennbar?: boolean;
    case_governance?: string;
  };
  // Noun-specific
  noun?: {
    gen_singular?: string;
    dat_singular?: string;
    akk_singular?: string;
    gen_plural?: string;
    dat_plural?: string;
    akk_plural?: string;
  };
  isSystem: boolean;
  createdBy?: ObjectId; // user who added (if not system)
  createdAt: Date;
}

export interface UserVocabularyProgressDoc {
  _id: ObjectId;
  userId: ObjectId;
  wordId: ObjectId;
  status: WordStatus;
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
  dueDate: string; // YYYY-MM-DD
  lastReviewedAt: Date | null;
  correctCount: number;
  wrongCount: number;
  addedAt: Date;
}

export interface SRSReviewDoc {
  _id: ObjectId;
  userId: ObjectId;
  wordId: ObjectId;
  rating: SRSRating;
  timeTakenMs?: number;
  reviewedAt: Date;
  intervalBefore: number;
  intervalAfter: number;
}

// ─── GRAMMAR ────────────────────────────────────────────────────────────────
export interface GrammarRule {
  rule: string;
  example_de: string;
  example_ru: string;
}
export interface Exercise {
  type: "fill_blank" | "choose_correct" | "translation" | "reorder";
  sentence?: string;
  question?: string;
  options?: string[];
  answer: string | number | string[];
  explanation?: string;
  hint?: string;
}
export interface MiniTestQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ReadingTextDoc {
  _id: ObjectId;
  title: string;
  content: string;
  cefr_level: CEFRLevel;
  topic: string;
  word_count: number;
  read_time_min: number;
  questions: MiniTestQuestion[];
  audio_url?: string;
  isSystem: boolean;
  createdBy?: ObjectId;
  createdAt: Date;
}

export interface UserReadingProgressDoc {
  _id: ObjectId;
  userId: ObjectId;
  textId: ObjectId;
  status: "completed";
  score: number;
  correctCount: number;
  questionsTotal: number;
  answers: Record<string, number>;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
}
export interface GrammarTopicDoc {
  _id: ObjectId;
  slug: string;
  title_de: string;
  title_ru: string;
  cefr_level: CEFRLevel;
  category: string;
  order_index: number;
  content: {
    explanation: string;
    rules: GrammarRule[];
    typical_errors: string[];
    real_life_connection: string;
  };
  exercises: Exercise[];
  mini_test: MiniTestQuestion[];
  isPublished: boolean;
}

export interface UserGrammarProgressDoc {
  _id: ObjectId;
  userId: ObjectId;
  topicId: ObjectId;
  topicSlug: string;
  status: "not_started" | "in_progress" | "completed" | "needs_review";
  score: number | null;
  attempts: number;
  lastStudiedAt: Date | null;
  completedAt: Date | null;
}

// ─── DAILY PLAN ─────────────────────────────────────────────────────────────
export type PlanStepType =
  | "vocabulary_review"
  | "new_words"
  | "grammar"
  | "reading"
  | "writing"
  | "test";

export type PlanStepStatus = "pending" | "in_progress" | "completed";

export interface PlanStepResult {
  correctAnswers?: number;
  totalAnswers?: number;
  accuracy?: number;
  wordsLearned?: number;
  wordsReviewed?: number;
  timeSpentMinutes?: number;
}

export interface PlanStep {
  id: string;
  type: PlanStepType;
  label: string;
  estimatedMinutes: number;
  status: PlanStepStatus;
  order: number;
  payload: Record<string, unknown>;
  topicSlug?: string;
  topicId?: string;
  textId?: string;
  templateId?: string;
  wordIds?: string[]; // ObjectId strings
  count?: number;
  completed?: boolean;
  startedAt?: Date | null;
  completedAt?: Date | null;
  result?: PlanStepResult | null;
}

export interface DailyPlanDoc {
  _id: ObjectId;
  userId: ObjectId;
  planDate: string; // YYYY-MM-DD
  status: "pending" | "in_progress" | "completed" | "skipped";
  steps: PlanStep[];
  estimatedMinutes: number;
  focusAreas: string[];
  stepsCompleted: number;
  progressPercent?: number;
  score: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

// ─── PLACEMENT / ONBOARDING ─────────────────────────────────────────────────
export interface PlacementQuestionDoc {
  _id: ObjectId;
  order: number;
  question_de: string;
  question_ru: string;
  type: "multiple_choice" | "fill_blank" | "article" | "case" | "reading";
  options: string[];
  answer: number; // index in options
  explanation: string;
  cefr_level: CEFRLevel; // difficulty of this question
  skill: "grammar" | "vocabulary" | "reading" | "articles" | "cases";
  area: string; // e.g. "akkusativ", "perfekt"
}

export interface UserTestResultDoc {
  _id: ObjectId;
  userId: ObjectId;
  testType: "placement" | "level_quiz";
  questionsTotal: number;
  correctCount: number;
  score: number;
  detectedLevel: CEFRLevel;
  weakAreas: string[]; // grammar areas where score < 60%
  answers: { questionId: string; selected: number; correct: boolean }[];
  takenAt: Date;
}

export interface OnboardingQuestionDoc {
  _id: ObjectId;
  order: number;
  key: string; // unique key like "learning_goals"
  question_ru: string;
  description_ru?: string;
  type: "multi_select" | "single_select" | "slider";
  field: keyof UserDoc; // which UserDoc field this updates
  options?: { value: string; label_ru: string; emoji?: string }[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

// ─── WRITING ────────────────────────────────────────────────────────────────
export interface WritingStructurePart {
  name: string;
  example: string;
  tip: string;
}

export interface WritingTaskDoc {
  _id: ObjectId;
  title: string;
  type: "formal" | "informal" | "application";
  topic: string;
  cefr_level: CEFRLevel;
  prompt: string;
  structure: { parts: WritingStructurePart[] };
  example: string;
  key_phrases: string[];
}

export interface WritingError {
  original: string;
  correction: string;
  explanation: string;
  rule: string;
  severity: "critical" | "important" | "minor";
}

export interface WritingFeedback {
  overall_score: number;
  level_assessment: CEFRLevel;
  errors: WritingError[];
  style_tips: string[];
  structure_feedback: string;
  positive_feedback: string;
  suggested_phrases: string[];
}

export interface UserWritingSubmissionDoc {
  _id: ObjectId;
  userId: ObjectId;
  taskId: ObjectId | null;
  content: string;
  feedback: WritingFeedback | null;
  score: number | null;
  errorsCount: number | null;
  submittedAt: Date;
}

// ─── STATS ──────────────────────────────────────────────────────────────────
export interface DailyStatsDoc {
  _id: ObjectId;
  userId: ObjectId;
  date: string; // YYYY-MM-DD
  wordsReviewed: number;
  wordsLearned: number;
  minutesStudied: number;
  grammarCompleted: number;
  writingsDone: number;
  correctAnswers: number;
  totalAnswers: number;
}

// ─── Focused Practice ────────────────────────────────────────────────────────
export type FocusedPracticeType = "grammar" | "vocabulary" | "reading" | "mixed";
export type FocusedPracticeStatus = "in_progress" | "completed";
export type FocusedPracticeTaskType = "multiple_choice" | "fill_blank" | "translate" | "sentence_order";

export interface FocusedPracticeTask {
  id: string;
  taskType: FocusedPracticeTaskType;
  question: string;
  options: string[];
  correctAnswer: string | number;
  userAnswer?: string | number | null;
  explanation: string;
  sourceType: "grammar" | "vocabulary" | "reading" | "fallback";
  sourceId?: string;
}

export interface FocusedPracticeSessionDoc {
  _id: ObjectId;
  userId: ObjectId;
  topic: string;
  type: FocusedPracticeType;
  status: FocusedPracticeStatus;
  tasks: FocusedPracticeTask[];
  score: number | null;
  mistakes: string[];
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export type WordType = "noun" | "verb" | "adjective" | "adverb" | "phrase" | "preposition" | "conjunction";
export type CEFRLevel = "A1" | "A2" | "B1" | "B2";
export type WordStatus = "new" | "learning" | "review" | "known" | "suspended";
export type SRSRating = "again" | "hard" | "good" | "easy";

export interface VerbData {
  infinitive: string;
  praesens_ich: string;
  praesens_du: string;
  praesens_er: string;
  praeteritum: string;
  perfekt: string;
  partizip_2: string;
  hilfsverb: "haben" | "sein";
  is_trennbar: boolean;
  prefix?: string;
  case_governance?: string;
  case_example?: string;
  is_reflexive: boolean;
  reflexive_case?: string;
}

export interface NounData {
  declension_type?: string;
  gen_singular?: string;
  dat_singular?: string;
  akk_singular?: string;
  gen_plural?: string;
  dat_plural?: string;
  akk_plural?: string;
}

export interface Word {
  id: string;
  german: string;
  translation_ru: string;
  translation_en?: string;
  article?: string;
  plural?: string;
  word_type: WordType;
  cefr_level: CEFRLevel;
  topic?: string;
  frequency_rank?: number;
  example_de?: string;
  example_ru?: string;
  audio_url?: string;
  notes?: string;
  grammarInfo?: string;
  frequencyLevel?: "low" | "medium" | "high";
  is_system: boolean;
  created_at: string;
  verb_data?: VerbData;
  noun_data?: NounData;
}

export interface WordProgress {
  id: string;
  user_id: string;
  word_id: string;
  status: WordStatus;
  ease_factor: number;
  interval_days: number;
  repetition_count: number;
  due_date: string;
  last_reviewed_at?: string;
  correct_count: number;
  wrong_count: number;
  added_at: string;
  word?: Word;
}

export interface SRSReview {
  id: string;
  user_id: string;
  word_id: string;
  rating: SRSRating;
  time_taken_ms?: number;
  reviewed_at: string;
  interval_before: number;
  interval_after: number;
}

// ─── Grammar ──────────────────────────────────────────────────────────────────

export type GrammarCategory = "cases" | "verbs" | "sentences" | "prepositions" | "adjectives" | "word-order";
export type GrammarStatus = "not_started" | "in_progress" | "completed" | "needs_review";

export interface GrammarRule {
  rule: string;
  example_de: string;
  example_ru: string;
}

export interface GrammarContent {
  explanation: string;
  rules: GrammarRule[];
  typical_errors: string[];
  real_life_connection: string;
}

export type ExerciseType = "fill_blank" | "choose_correct" | "translation" | "reorder";

export interface Exercise {
  type: ExerciseType;
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

export interface GrammarTopic {
  id: string;
  slug: string;
  title_de: string;
  title_ru: string;
  cefr_level: CEFRLevel;
  category: GrammarCategory;
  order_index: number;
  content_json: GrammarContent;
  exercises: Exercise[];
  mini_test: MiniTestQuestion[];
  is_published: boolean;
}

export interface GrammarProgress {
  user_id: string;
  topic_id: string;
  status: GrammarStatus;
  score?: number;
  attempts: number;
  last_studied_at?: string;
  completed_at?: string;
}

// ─── Daily Plan ───────────────────────────────────────────────────────────────

export type PlanStepType = "vocabulary_review" | "new_words" | "grammar" | "reading" | "writing" | "test";
export type PlanStatus = "pending" | "in_progress" | "completed" | "skipped";
export type PlanStepStatus = "pending" | "in_progress" | "completed";

export interface PlanStep {
  id: string;
  type: PlanStepType;
  label: string;
  estimatedMinutes: number;
  status: PlanStepStatus;
  order: number;
  payload: Record<string, unknown>;
  wordIds?: string[];
  topicSlug?: string;
  topicId?: string;
  textId?: string;
  templateId?: string;
  questions?: MiniTestQuestion[];
  count?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  result?: {
    correctAnswers?: number;
    totalAnswers?: number;
    accuracy?: number;
    wordsLearned?: number;
    wordsReviewed?: number;
    timeSpentMinutes?: number;
  } | null;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  plan_date: string;
  status: PlanStatus;
  plan_json: { steps: PlanStep[]; estimatedMinutes: number; focusAreas: string[] };
  steps_total: number;
  steps_completed: number;
  score?: number;
  started_at?: string;
  completed_at?: string;
}

// ─── Writing ──────────────────────────────────────────────────────────────────

export type WritingTopic =
  | "Wohnung"
  | "Arbeit"
  | "Behörden"
  | "Krankenkasse"
  | "Arzt"
  | "Bewerbung"
  | "Jobcenter"
  | "Einkauf"
  | "Reise"
  | "Ausbildung"
  | "Studium"
  | "Alltag";
export type WritingTaskType =
  | "formal_email"
  | "informal_message"
  | "complaint"
  | "request"
  | "application"
  | "appointment"
  | "opinion_text"
  | "exam_letter";
export type WritingProgressStatus = "new" | "in_progress" | "completed";

export interface WritingTemplate {
  id: string;
  title: string;
  level: CEFRLevel;
  cefr_level: CEFRLevel;
  topic: WritingTopic;
  type: WritingTaskType;
  instructions: string;
  prompt: string;
  requirements: string[];
  hints: string[];
  usefulPhrases: string[];
  key_phrases: string[];
  minWords: number;
  estimatedMinutes: number;
  idealAnswer: string;
  status: WritingProgressStatus;
  lastScore: number | null;
  attemptsCount: number;
  lastSubmissionId: string | null;
}

export interface WritingError {
  type: "grammar" | "vocabulary" | "word_order" | "article" | "case" | "spelling" | "style";
  original: string;
  correct: string;
  explanationRu: string;
  severity: "low" | "medium" | "high";
}

export interface WritingFeedback {
  score: number;
  estimatedLevel: CEFRLevel;
  summary: string;
  correctedText: string;
  improvedVersion: string;
  errors: WritingError[];
  strengths: string[];
  suggestions: string[];
  weakAreas: string[];
  usefulPhrases: string[];
}

export interface UserWriting {
  id: string;
  taskId: string;
  attemptNumber: number;
  text: string;
  aiFeedback: WritingFeedback;
  score: number;
  estimatedLevel: CEFRLevel;
  weakAreas: string[];
  createdAt: string;
}

// ─── Progress & Stats ─────────────────────────────────────────────────────────

export interface UserSettings {
  user_id: string;
  daily_goal_words: number;
  daily_goal_minutes: number;
  current_level: CEFRLevel;
  target_level: CEFRLevel;
  profession?: string | null;
  weak_areas: string[];
  preferred_topics: string[];
  interface_theme: "light" | "dark" | "system";
  streak_count: number;
  streak_last_date?: string;
  total_study_days: number;
}

export interface DailyStats {
  user_id: string;
  stat_date: string;
  words_reviewed: number;
  words_learned: number;
  minutes_studied: number;
  grammar_completed: number;
  writings_done: number;
  avg_accuracy?: number;
}

export interface ProgressSummary {
  totalWords: number;
  knownWords: number;
  learningWords: number;
  streakDays: number;
  totalStudyDays: number;
  grammarTopicsCompleted: number;
  grammarTopicsTotal: number;
  writingsDone: number;
  avgAccuracy: number;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  levelProgress: number; // 0–100
  estimatedDaysToTarget: number;
}

// ─── AI Tutor ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ─── Reading ──────────────────────────────────────────────────────────────────

export interface ReadingText {
  id: string;
  title: string;
  content: string;
  cefr_level: CEFRLevel;
  topic: string;
  word_count?: number;
  read_time_min?: number;
  questions?: MiniTestQuestion[];
  audio_url?: string;
  created_at: string;
  progress?: ReadingProgress | null;
  recommended?: boolean;
  recommendation_score?: number;
  recommendation_reason?: string | null;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  text_id: string;
  status: "completed";
  score: number;
  correct_count: number;
  questions_total: number;
  answers: Record<string, number>;
  started_at?: string | null;
  completed_at?: string | null;
  updated_at: string;
}

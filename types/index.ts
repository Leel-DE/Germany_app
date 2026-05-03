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

export type PlanStepType = "srs_review" | "new_words" | "grammar" | "reading" | "writing" | "mini_test" | "listening";
export type PlanStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface PlanStep {
  type: PlanStepType;
  label: string;
  estimatedMinutes: number;
  wordIds?: string[];
  topicSlug?: string;
  topicId?: string;
  textId?: string;
  templateId?: string;
  questions?: MiniTestQuestion[];
  count?: number;
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

export interface WritingStructurePart {
  name: string;
  example: string;
  tip: string;
}

export interface WritingTemplate {
  id: string;
  title: string;
  type: "formal" | "informal" | "application";
  topic: string;
  cefr_level: CEFRLevel;
  prompt: string;
  structure: { parts: WritingStructurePart[] };
  example: string;
  key_phrases: string[];
  vocabulary_ids?: string[];
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

export interface UserWriting {
  id: string;
  user_id: string;
  template_id?: string;
  content: string;
  ai_feedback?: WritingFeedback;
  score?: number;
  errors_count?: number;
  written_at: string;
  template?: WritingTemplate;
}

// ─── Progress & Stats ─────────────────────────────────────────────────────────

export interface UserSettings {
  user_id: string;
  daily_goal_words: number;
  daily_goal_minutes: number;
  current_level: CEFRLevel;
  target_level: CEFRLevel;
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
}

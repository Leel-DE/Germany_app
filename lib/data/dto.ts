import type {
  DailyPlanDoc,
  GrammarTopicDoc,
  ReadingTextDoc,
  UserReadingProgressDoc,
  UserGrammarProgressDoc,
  UserVocabularyProgressDoc,
  VocabularyDoc,
  WritingTaskDoc,
  UserWritingDraftDoc,
  UserWritingProgressDoc,
  UserWritingSubmissionDoc,
} from "@/lib/models/types";

export function vocabularyDTO(word: VocabularyDoc, progress?: UserVocabularyProgressDoc | null) {
  return {
    id: word._id.toString(),
    german: word.german,
    translation_ru: word.translation_ru,
    translation_en: word.translation_en,
    article: word.article,
    plural: word.plural,
    word_type: word.word_type,
    cefr_level: word.cefr_level,
    topic: word.topic,
    frequency_rank: word.frequency_rank,
    example_de: word.example_de,
    example_ru: word.example_ru,
    notes: word.notes,
    grammarInfo: word.grammarInfo,
    frequencyLevel: word.frequencyLevel,
    is_system: word.isSystem,
    created_at: word.createdAt.toISOString(),
    progress: progress
      ? {
          status: progress.status,
          ease_factor: progress.easeFactor,
          interval_days: progress.intervalDays,
          repetition_count: progress.repetitionCount,
          due_date: progress.dueDate,
          last_reviewed_at: progress.lastReviewedAt?.toISOString() ?? null,
          correct_count: progress.correctCount,
          wrong_count: progress.wrongCount,
        }
      : null,
  };
}

export function grammarDTO(topic: GrammarTopicDoc, progress?: UserGrammarProgressDoc | null) {
  return {
    id: topic._id.toString(),
    slug: topic.slug,
    title_de: topic.title_de,
    title_ru: topic.title_ru,
    cefr_level: topic.cefr_level,
    category: topic.category,
    order_index: topic.order_index,
    content_json: topic.content,
    exercises: topic.exercises,
    mini_test: topic.mini_test,
    is_published: topic.isPublished,
    progress: progress
      ? {
          status: progress.status,
          score: progress.score,
          attempts: progress.attempts,
          last_studied_at: progress.lastStudiedAt?.toISOString() ?? null,
          completed_at: progress.completedAt?.toISOString() ?? null,
        }
      : null,
  };
}

export function readingTextDTO(text: ReadingTextDoc, progress?: UserReadingProgressDoc | null) {
  return {
    id: text._id.toString(),
    title: text.title,
    content: text.content,
    cefr_level: text.cefr_level,
    topic: text.topic,
    word_count: text.word_count,
    read_time_min: text.read_time_min,
    questions: text.questions,
    audio_url: text.audio_url,
    created_at: text.createdAt.toISOString(),
    progress: progress ? readingProgressDTO(progress) : null,
  };
}

export function readingProgressDTO(progress: UserReadingProgressDoc) {
  return {
    id: progress._id.toString(),
    user_id: progress.userId.toString(),
    text_id: progress.textId.toString(),
    status: progress.status,
    score: progress.score,
    correct_count: progress.correctCount,
    questions_total: progress.questionsTotal,
    answers: progress.answers,
    started_at: progress.startedAt?.toISOString() ?? null,
    completed_at: progress.completedAt?.toISOString() ?? null,
    updated_at: progress.updatedAt.toISOString(),
  };
}

export function dailyPlanDTO(plan: DailyPlanDoc) {
  return {
    id: plan._id.toString(),
    user_id: plan.userId.toString(),
    plan_date: plan.planDate,
    status: plan.status,
    steps: plan.steps.map((step, index) => ({
      ...step,
      id: step.id ?? String(index),
      status: step.status ?? (step.completed ? "completed" : "pending"),
      order: step.order ?? index,
      payload: step.payload ?? {},
      startedAt: step.startedAt?.toISOString?.() ?? null,
      completedAt: step.completedAt?.toISOString?.() ?? null,
    })),
    plan_json: {
      steps: plan.steps,
      estimatedMinutes: plan.estimatedMinutes,
      focusAreas: plan.focusAreas,
    },
    estimated_minutes: plan.estimatedMinutes,
    steps_total: plan.steps.length,
    steps_completed: plan.stepsCompleted,
    progress_percent: plan.progressPercent ?? (plan.steps.length ? Math.round((plan.stepsCompleted / plan.steps.length) * 100) : 0),
    score: plan.score,
    started_at: plan.startedAt?.toISOString() ?? null,
    completed_at: plan.completedAt?.toISOString() ?? null,
  };
}

export function writingTaskDTO(task: WritingTaskDoc, progress?: UserWritingProgressDoc | null) {
  const instructions = task.instructions ?? task.prompt ?? "";
  const usefulPhrases = task.useful_phrases ?? task.key_phrases ?? [];
  const idealAnswer = task.ideal_answer ?? task.example ?? "";
  return {
    id: task._id.toString(),
    title: task.title,
    type: task.type,
    topic: task.topic,
    cefr_level: task.cefr_level,
    instructions,
    requirements: task.requirements ?? [],
    hints: task.hints ?? [],
    useful_phrases: usefulPhrases,
    min_words: task.min_words ?? 60,
    estimated_minutes: task.estimated_minutes ?? 12,
    ideal_answer: idealAnswer,
    structure: task.structure ?? null,
    // legacy mirrors
    prompt: instructions,
    example: idealAnswer,
    key_phrases: usefulPhrases,
    progress: progress ? writingProgressDTO(progress) : null,
  };
}

export function writingProgressDTO(progress: UserWritingProgressDoc) {
  return {
    id: progress._id.toString(),
    task_id: progress.taskId.toString(),
    status: progress.status,
    best_score: progress.bestScore,
    attempts_count: progress.attemptsCount,
    last_submission_id: progress.lastSubmissionId?.toString() ?? null,
    weak_areas: progress.weakAreas ?? [],
    completed_at: progress.completedAt?.toISOString() ?? null,
    updated_at: progress.updatedAt.toISOString(),
  };
}

export function writingDraftDTO(draft: UserWritingDraftDoc) {
  return {
    id: draft._id.toString(),
    task_id: draft.taskId.toString(),
    text: draft.text,
    updated_at: draft.updatedAt.toISOString(),
  };
}

export function writingSubmissionDTO(sub: UserWritingSubmissionDoc) {
  return {
    id: sub._id.toString(),
    task_id: sub.taskId?.toString() ?? null,
    attempt_number: sub.attemptNumber ?? 1,
    content: sub.content,
    feedback: sub.feedback,
    score: sub.score,
    estimated_level: sub.estimatedLevel ?? null,
    weak_areas: sub.weakAreas ?? [],
    errors_count: sub.errorsCount,
    submitted_at: sub.submittedAt.toISOString(),
  };
}

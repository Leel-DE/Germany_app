import type { Collection } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type {
  UserDoc,
  VocabularyDoc,
  UserVocabularyProgressDoc,
  SRSReviewDoc,
  GrammarTopicDoc,
  ReadingTextDoc,
  UserGrammarProgressDoc,
  UserReadingProgressDoc,
  DailyPlanDoc,
  PlacementQuestionDoc,
  OnboardingQuestionDoc,
  UserTestResultDoc,
  WritingTaskDoc,
  UserWritingSubmissionDoc,
  UserWritingDraftDoc,
  UserWritingProgressDoc,
  DailyStatsDoc,
  FocusedPracticeSessionDoc,
} from "./types";

export const COLL = {
  users: "users",
  vocabulary: "vocabulary_items",
  userVocabularyProgress: "user_vocabulary_progress",
  srsReviews: "srs_reviews",
  grammarTopics: "grammar_topics",
  userGrammarProgress: "user_grammar_progress",
  readingTexts: "reading_texts",
  userReadingProgress: "user_reading_progress",
  dailyPlans: "daily_plans",
  placementQuestions: "placement_questions",
  onboardingQuestions: "onboarding_questions",
  userTestResults: "user_test_results",
  writingTasks: "writing_tasks",
  userWritingSubmissions: "user_writing_submissions",
  userWritingDrafts: "user_writing_drafts",
  userWritingProgress: "user_writing_progress",
  dailyStats: "daily_stats",
  focusedPracticeSessions: "focused_practice_sessions",
} as const;

export async function usersColl(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>(COLL.users);
}
export async function vocabularyColl(): Promise<Collection<VocabularyDoc>> {
  return (await getDb()).collection<VocabularyDoc>(COLL.vocabulary);
}
export async function userVocabProgressColl(): Promise<Collection<UserVocabularyProgressDoc>> {
  return (await getDb()).collection<UserVocabularyProgressDoc>(COLL.userVocabularyProgress);
}
export async function srsReviewsColl(): Promise<Collection<SRSReviewDoc>> {
  return (await getDb()).collection<SRSReviewDoc>(COLL.srsReviews);
}
export async function grammarTopicsColl(): Promise<Collection<GrammarTopicDoc>> {
  return (await getDb()).collection<GrammarTopicDoc>(COLL.grammarTopics);
}
export async function userGrammarProgressColl(): Promise<Collection<UserGrammarProgressDoc>> {
  return (await getDb()).collection<UserGrammarProgressDoc>(COLL.userGrammarProgress);
}
export async function readingTextsColl(): Promise<Collection<ReadingTextDoc>> {
  return (await getDb()).collection<ReadingTextDoc>(COLL.readingTexts);
}
export async function userReadingProgressColl(): Promise<Collection<UserReadingProgressDoc>> {
  return (await getDb()).collection<UserReadingProgressDoc>(COLL.userReadingProgress);
}
export async function dailyPlansColl(): Promise<Collection<DailyPlanDoc>> {
  return (await getDb()).collection<DailyPlanDoc>(COLL.dailyPlans);
}
export async function placementQuestionsColl(): Promise<Collection<PlacementQuestionDoc>> {
  return (await getDb()).collection<PlacementQuestionDoc>(COLL.placementQuestions);
}
export async function onboardingQuestionsColl(): Promise<Collection<OnboardingQuestionDoc>> {
  return (await getDb()).collection<OnboardingQuestionDoc>(COLL.onboardingQuestions);
}
export async function userTestResultsColl(): Promise<Collection<UserTestResultDoc>> {
  return (await getDb()).collection<UserTestResultDoc>(COLL.userTestResults);
}
export async function writingTasksColl(): Promise<Collection<WritingTaskDoc>> {
  return (await getDb()).collection<WritingTaskDoc>(COLL.writingTasks);
}
export async function userWritingSubmissionsColl(): Promise<Collection<UserWritingSubmissionDoc>> {
  return (await getDb()).collection<UserWritingSubmissionDoc>(COLL.userWritingSubmissions);
}
export async function userWritingDraftsColl(): Promise<Collection<UserWritingDraftDoc>> {
  return (await getDb()).collection<UserWritingDraftDoc>(COLL.userWritingDrafts);
}
export async function userWritingProgressColl(): Promise<Collection<UserWritingProgressDoc>> {
  return (await getDb()).collection<UserWritingProgressDoc>(COLL.userWritingProgress);
}
export async function dailyStatsColl(): Promise<Collection<DailyStatsDoc>> {
  return (await getDb()).collection<DailyStatsDoc>(COLL.dailyStats);
}
export async function focusedPracticeSessionsColl(): Promise<Collection<FocusedPracticeSessionDoc>> {
  return (await getDb()).collection<FocusedPracticeSessionDoc>(COLL.focusedPracticeSessions);
}

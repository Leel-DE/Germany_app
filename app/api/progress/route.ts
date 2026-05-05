import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { scoreLevelProgress } from "@/lib/data/personalization";
import {
  grammarTopicsColl,
  userGrammarProgressColl,
  userVocabProgressColl,
  userWritingSubmissionsColl,
} from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const [vocab, grammarTotal, grammarDone, writings] = await Promise.all([
    (await userVocabProgressColl()).find({ userId: auth.user._id }).toArray(),
    (await grammarTopicsColl()).countDocuments({ isPublished: true }),
    (await userGrammarProgressColl()).countDocuments({ userId: auth.user._id, status: "completed" }),
    (await userWritingSubmissionsColl()).countDocuments({ userId: auth.user._id }),
  ]);
  const knownWords = vocab.filter((row) => row.status === "known" || row.status === "review").length;

  return NextResponse.json({
    summary: {
      totalWords: vocab.length,
      knownWords,
      learningWords: vocab.filter((row) => row.status === "learning").length,
      streakDays: auth.user.streakCount,
      totalStudyDays: auth.user.totalStudyDays,
      grammarTopicsCompleted: grammarDone,
      grammarTopicsTotal: grammarTotal,
      writingsDone: writings,
      avgAccuracy: 0,
      currentLevel: auth.user.currentGermanLevel,
      targetLevel: auth.user.targetGermanLevel,
      levelProgress: scoreLevelProgress(auth.user.currentGermanLevel, auth.user.targetGermanLevel, knownWords),
      estimatedDaysToTarget: Math.max(7, Math.round((1500 - knownWords) / Math.max(1, auth.user.dailyStudyMinutes / 10))),
    },
  });
}

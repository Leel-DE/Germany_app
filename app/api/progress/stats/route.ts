import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { dailyStatsColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const stats = await (await dailyStatsColl())
    .find({ userId: auth.user._id })
    .sort({ date: -1 })
    .limit(30)
    .toArray();

  return NextResponse.json({
    stats: stats.map((row) => ({
      date: row.date,
      wordsReviewed: row.wordsReviewed,
      wordsLearned: row.wordsLearned,
      minutesStudied: row.minutesStudied,
      grammarCompleted: row.grammarCompleted,
      writingCompleted: row.writingsDone,
      accuracy: row.totalAnswers ? Math.round((row.correctAnswers / row.totalAnswers) * 100) : 0,
    })),
  });
}

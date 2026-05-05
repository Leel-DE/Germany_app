import { ObjectId } from "mongodb";
import { dailyStatsColl, usersColl } from "@/lib/models/collections";
import type { DailyStatsDoc } from "@/lib/models/types";
import { todayKey } from "./personalization";

type ProgressDelta = Partial<
  Pick<
    DailyStatsDoc,
    | "wordsReviewed"
    | "wordsLearned"
    | "minutesStudied"
    | "grammarCompleted"
    | "writingsDone"
    | "correctAnswers"
    | "totalAnswers"
  >
>;

export async function recordProgressActivity(userId: ObjectId, delta: ProgressDelta, date = new Date()) {
  const dateKey = todayKey(date);
  const increments = Object.fromEntries(
    Object.entries(delta).filter(([, value]) => typeof value === "number" && value > 0)
  );

  if (Object.keys(increments).length === 0) {
    await touchStudyStreak(userId, dateKey);
    return;
  }

  await (await dailyStatsColl()).updateOne(
    { userId, date: dateKey },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        userId,
        date: dateKey,
        wordsReviewed: 0,
        wordsLearned: 0,
        minutesStudied: 0,
        grammarCompleted: 0,
        writingsDone: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      },
      $inc: increments,
    },
    { upsert: true }
  );

  await touchStudyStreak(userId, dateKey);
}

async function touchStudyStreak(userId: ObjectId, dateKey: string) {
  const users = await usersColl();
  const user = await users.findOne(
    { _id: userId },
    { projection: { streakLastDate: 1, streakCount: 1, totalStudyDays: 1 } }
  );
  if (!user || user.streakLastDate === dateKey) return;

  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  const previousDateKey = todayKey(date);
  const nextStreak = user.streakLastDate === previousDateKey ? (user.streakCount ?? 0) + 1 : 1;

  await users.updateOne(
    { _id: userId },
    {
      $set: {
        streakLastDate: dateKey,
        streakCount: nextStreak,
        updatedAt: new Date(),
      },
      $inc: { totalStudyDays: 1 },
    }
  );
}

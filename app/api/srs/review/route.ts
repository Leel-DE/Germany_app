import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import { calculateNextReview } from "@/lib/srs/sm2";
import { srsReviewsColl, userVocabProgressColl } from "@/lib/models/collections";

const ReviewSchema = z.object({
  wordId: z.string(),
  rating: z.enum(["again", "hard", "good", "easy"]),
  timeTakenMs: z.number().int().min(0).max(300000).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = ReviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !ObjectId.isValid(parsed.data.wordId)) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  const wordId = new ObjectId(parsed.data.wordId);
  const progressColl = await userVocabProgressColl();
  const progress = await progressColl.findOne({ userId: auth.user._id, wordId });
  if (!progress) return NextResponse.json({ error: "Card is not assigned to this user" }, { status: 404 });

  const result = calculateNextReview(progress, parsed.data.rating);
  const now = new Date();
  await progressColl.updateOne(
    { _id: progress._id, userId: auth.user._id },
    {
      $set: {
        easeFactor: result.newEaseFactor,
        intervalDays: result.newInterval,
        repetitionCount: result.newRepetitionCount,
        dueDate: result.nextDueDate.toISOString().slice(0, 10),
        lastReviewedAt: now,
        status: result.newRepetitionCount >= 3 ? "review" : "learning",
      },
      $inc: parsed.data.rating === "again" ? { wrongCount: 1 } : { correctCount: 1 },
    }
  );

  await (await srsReviewsColl()).insertOne({
    _id: new ObjectId(),
    userId: auth.user._id,
    wordId,
    rating: parsed.data.rating,
    timeTakenMs: parsed.data.timeTakenMs,
    reviewedAt: now,
    intervalBefore: progress.intervalDays,
    intervalAfter: result.newInterval,
  });

  await recordProgressActivity(auth.user._id, {
    wordsReviewed: 1,
    wordsLearned: progress.repetitionCount === 0 && parsed.data.rating !== "again" ? 1 : 0,
    minutesStudied: 1,
    correctAnswers: parsed.data.rating === "again" ? 0 : 1,
    totalAnswers: 1,
  });

  return NextResponse.json({
    wordId: parsed.data.wordId,
    newEaseFactor: result.newEaseFactor,
    newInterval: result.newInterval,
    newRepetitionCount: result.newRepetitionCount,
    nextDueDate: result.nextDueDate.toISOString(),
  });
}

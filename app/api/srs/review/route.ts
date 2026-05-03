import { NextRequest, NextResponse } from "next/server";
import { calculateNextReview } from "@/lib/srs/sm2";
import type { SRSRating } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { wordId, rating, easeFactor, intervalDays, repetitionCount } = await req.json() as {
      wordId: string;
      rating: SRSRating;
      easeFactor: number;
      intervalDays: number;
      repetitionCount: number;
    };

    const result = calculateNextReview({ easeFactor, intervalDays, repetitionCount }, rating);

    // In production: update user_word_progress in Supabase here
    // const supabase = await createClient();
    // await supabase.from("user_word_progress").upsert({...})

    return NextResponse.json({
      wordId,
      newEaseFactor: result.newEaseFactor,
      newInterval: result.newInterval,
      newRepetitionCount: result.newRepetitionCount,
      nextDueDate: result.nextDueDate.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}

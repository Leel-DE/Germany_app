import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import { grammarTopicsColl, userGrammarProgressColl } from "@/lib/models/collections";

const CompleteSchema = z.object({
  score: z.number().min(0).max(100).nullable().optional(),
  mistakes: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest, ctx: RouteContext<"/api/grammar-lessons/[slug]/complete">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { slug } = await ctx.params;
  const parsed = CompleteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid completion payload" }, { status: 400 });

  const topic = await (await grammarTopicsColl()).findOne({ slug, isPublished: true });
  if (!topic) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const now = new Date();
  const progressColl = await userGrammarProgressColl();
  const existing = await progressColl.findOne({ userId: auth.user._id, topicId: topic._id });
  await progressColl.updateOne(
    { userId: auth.user._id, topicId: topic._id },
    {
      $set: {
        topicSlug: topic.slug,
        status: "completed",
        score: parsed.data.score ?? null,
        lastStudiedAt: now,
        completedAt: now,
      },
      $setOnInsert: { _id: new ObjectId(), userId: auth.user._id, topicId: topic._id },
      $inc: { attempts: 1 },
    },
    { upsert: true }
  );

  await recordProgressActivity(auth.user._id, {
    grammarCompleted: existing?.status === "completed" ? 0 : 1,
    minutesStudied: 10,
    correctAnswers: parsed.data.score == null ? 0 : Math.round(parsed.data.score / 10),
    totalAnswers: parsed.data.score == null ? 0 : 10,
  });

  return NextResponse.json({ ok: true });
}

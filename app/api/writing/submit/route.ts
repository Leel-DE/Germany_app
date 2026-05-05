import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import { userWritingSubmissionsColl } from "@/lib/models/collections";

const SubmitSchema = z.object({
  taskId: z.string().optional(),
  text: z.string().min(30).max(8000),
  feedback: z.unknown().nullable().optional(),
  score: z.number().min(0).max(100).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid writing submission" }, { status: 400 });

  const doc = {
    _id: new ObjectId(),
    userId: auth.user._id,
    taskId: parsed.data.taskId && ObjectId.isValid(parsed.data.taskId) ? new ObjectId(parsed.data.taskId) : null,
    content: parsed.data.text,
    feedback: parsed.data.feedback as never,
    score: parsed.data.score ?? null,
    errorsCount: Array.isArray((parsed.data.feedback as { errors?: unknown[] } | null)?.errors)
      ? ((parsed.data.feedback as { errors: unknown[] }).errors.length)
      : null,
    submittedAt: new Date(),
  };

  await (await userWritingSubmissionsColl()).insertOne(doc);
  await recordProgressActivity(auth.user._id, {
    writingsDone: 1,
    minutesStudied: Math.max(5, Math.ceil(parsed.data.text.length / 120)),
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}

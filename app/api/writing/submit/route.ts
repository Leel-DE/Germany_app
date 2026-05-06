import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { recordProgressActivity } from "@/lib/data/progressTracking";
import { userWritingSubmissionsColl } from "@/lib/models/collections";
import type { UserWritingSubmissionDoc } from "@/lib/models/types";

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

  const taskObjectId =
    parsed.data.taskId && ObjectId.isValid(parsed.data.taskId) ? new ObjectId(parsed.data.taskId) : null;
  const submissionsColl = await userWritingSubmissionsColl();
  const previousAttempts = taskObjectId
    ? await submissionsColl.countDocuments({ userId: auth.user._id, taskId: taskObjectId })
    : 0;
  const feedback = (parsed.data.feedback ?? null) as UserWritingSubmissionDoc["feedback"];
  const errorsArray = Array.isArray((feedback as { errors?: unknown[] } | null)?.errors)
    ? ((feedback as { errors: unknown[] }).errors as unknown[])
    : null;
  const doc: UserWritingSubmissionDoc = {
    _id: new ObjectId(),
    userId: auth.user._id,
    taskId: taskObjectId,
    attemptNumber: previousAttempts + 1,
    content: parsed.data.text,
    feedback,
    score: parsed.data.score ?? null,
    estimatedLevel: null,
    weakAreas: [],
    errorsCount: errorsArray ? errorsArray.length : null,
    submittedAt: new Date(),
  };

  await submissionsColl.insertOne(doc);
  await recordProgressActivity(auth.user._id, {
    writingsDone: 1,
    minutesStudied: Math.max(5, Math.ceil(parsed.data.text.length / 120)),
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}

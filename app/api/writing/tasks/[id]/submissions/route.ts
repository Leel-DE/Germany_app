import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { writingSubmissionDTO } from "@/lib/data/dto";
import { userWritingSubmissionsColl } from "@/lib/models/collections";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/writing/tasks/[id]/submissions">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const submissions = await (await userWritingSubmissionsColl())
    .find({ userId: auth.user._id, taskId: new ObjectId(id) })
    .sort({ submittedAt: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json({
    submissions: submissions.map(writingSubmissionDTO),
  });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { userWritingSubmissionsColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const submissions = await (await userWritingSubmissionsColl())
    .find({ userId: auth.user._id })
    .sort({ submittedAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({
    submissions: submissions.map((item) => ({
      id: item._id.toString(),
      taskId: item.taskId?.toString() ?? null,
      content: item.content,
      feedback: item.feedback,
      score: item.score,
      errorsCount: item.errorsCount,
      submittedAt: item.submittedAt.toISOString(),
    })),
  });
}

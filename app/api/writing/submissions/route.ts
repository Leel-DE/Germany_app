import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { userWritingSubmissionsColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const submissions = await (await userWritingSubmissionsColl())
    .find({ userId: auth.user._id, createdAt: { $exists: true } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({
    submissions: submissions.map((item) => ({
      id: item._id.toString(),
      taskId: item.taskId.toString(),
      attemptNumber: item.attemptNumber,
      text: item.text,
      aiFeedback: item.aiFeedback,
      score: item.score,
      estimatedLevel: item.estimatedLevel,
      weakAreas: item.weakAreas,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

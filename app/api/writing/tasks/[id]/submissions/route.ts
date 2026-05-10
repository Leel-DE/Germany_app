import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { userWritingSubmissionsColl } from "@/lib/models/collections";
import { parseObjectId, WritingRequestError } from "@/lib/writing/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/writing/tasks/[id]/submissions">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await ctx.params;
    const taskId = parseObjectId(id, "task id");
    const submissions = await (await userWritingSubmissionsColl())
      .find({ userId: auth.user._id, taskId, createdAt: { $exists: true } })
      .sort({ attemptNumber: 1 })
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
  } catch (error) {
    if (error instanceof WritingRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

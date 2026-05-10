import { NextResponse } from "next/server";
import { getClientKey, rateLimit } from "@/lib/auth/rateLimit";
import { requireUser } from "@/lib/auth/currentUser";
import {
  CheckWritingSchema,
  checkWriting,
  getWritingTask,
  parseObjectId,
  publicAIError,
  WritingRequestError,
} from "@/lib/writing/service";

export async function POST(req: Request, ctx: RouteContext<"/api/writing/[taskId]/check">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const limited = rateLimit(getClientKey(req, `writing:${auth.user._id.toString()}`), 8, 60 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many writing checks. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const { taskId: rawTaskId } = await ctx.params;
    const taskId = parseObjectId(rawTaskId, "task id");
    const parsed = CheckWritingSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid text" }, { status: 400 });

    const task = await getWritingTask(taskId);
    const locale = req.headers.get("x-next-intl-locale") ?? req.headers.get("accept-language") ?? auth.user.nativeLanguage ?? "ru";
    const { submission, feedback, wordCount } = await checkWriting(auth.user, task, parsed.data.text, locale);
    return NextResponse.json({
      feedback,
      submission: {
        id: submission._id.toString(),
        taskId: submission.taskId.toString(),
        attemptNumber: submission.attemptNumber,
        score: submission.score,
        estimatedLevel: submission.estimatedLevel,
        weakAreas: submission.weakAreas,
        createdAt: submission.createdAt.toISOString(),
      },
      wordCount,
    }, { status: 201 });
  } catch (error) {
    console.error("[writing-check]", error);
    if (error instanceof WritingRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const publicError = publicAIError(error);
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}

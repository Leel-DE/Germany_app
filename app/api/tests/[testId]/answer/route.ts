import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { AnswerSchema, parseObjectId, saveTestAnswer, TestRequestError } from "@/lib/tests/service";

export async function PATCH(req: Request, ctx: RouteContext<"/api/tests/[testId]/answer">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId } = await ctx.params;
    const parsed = AnswerSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
    await saveTestAnswer(
      auth.user,
      parseObjectId(testId, "test id"),
      parseObjectId(parsed.data.attemptId, "attempt id"),
      parseObjectId(parsed.data.questionId, "question id"),
      parsed.data.answer
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

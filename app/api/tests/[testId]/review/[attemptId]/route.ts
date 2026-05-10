import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { attemptDTO, getAttemptOrThrow, getQuestions, parseObjectId, reviewDTO, TestRequestError } from "@/lib/tests/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/tests/[testId]/review/[attemptId]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId, attemptId } = await ctx.params;
    const testObjectId = parseObjectId(testId, "test id");
    const [attempt, questions] = await Promise.all([
      getAttemptOrThrow(auth.user, testObjectId, parseObjectId(attemptId, "attempt id")),
      getQuestions(testObjectId),
    ]);
    return NextResponse.json({ attempt: attemptDTO(attempt), review: reviewDTO(questions, attempt) });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

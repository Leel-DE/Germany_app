import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { attemptDTO, getAttemptOrThrow, parseObjectId, TestRequestError } from "@/lib/tests/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/tests/[testId]/attempts/[attemptId]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId, attemptId } = await ctx.params;
    const attempt = await getAttemptOrThrow(auth.user, parseObjectId(testId, "test id"), parseObjectId(attemptId, "attempt id"));
    return NextResponse.json({ attempt: attemptDTO(attempt) });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

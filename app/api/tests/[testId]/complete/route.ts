import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { attemptDTO, CompleteSchema, completeTestAttempt, getTestOrThrow, parseObjectId, TestRequestError } from "@/lib/tests/service";

export async function POST(req: Request, ctx: RouteContext<"/api/tests/[testId]/complete">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId } = await ctx.params;
    const parsed = CompleteSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid complete payload" }, { status: 400 });
    const test = await getTestOrThrow(parseObjectId(testId, "test id"));
    const attempt = await completeTestAttempt(auth.user, test, parseObjectId(parsed.data.attemptId, "attempt id"));
    return NextResponse.json({ attempt: attemptDTO(attempt) });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

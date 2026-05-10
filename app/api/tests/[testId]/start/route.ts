import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { getTestOrThrow, parseObjectId, StartTestSchema, startTestAttempt, attemptDTO, TestRequestError } from "@/lib/tests/service";

export async function POST(req: Request, ctx: RouteContext<"/api/tests/[testId]/start">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId } = await ctx.params;
    const id = parseObjectId(testId, "test id");
    const parsed = StartTestSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Invalid start payload" }, { status: 400 });
    const test = await getTestOrThrow(id);
    const attempt = await startTestAttempt(auth.user, test, parsed.data.retry);
    return NextResponse.json({ attempt: attemptDTO(attempt) }, { status: 201 });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

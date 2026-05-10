import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { getQuestions, getTestOrThrow, parseObjectId, questionDTO, testDTO, TestRequestError } from "@/lib/tests/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/tests/[testId]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId } = await ctx.params;
    const id = parseObjectId(testId, "test id");
    const [test, questions] = await Promise.all([getTestOrThrow(id), getQuestions(id)]);
    return NextResponse.json({ test: testDTO(test), questions: questions.map((question) => questionDTO(question)) });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

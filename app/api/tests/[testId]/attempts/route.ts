import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { userTestAttemptsColl } from "@/lib/models/collections";
import { attemptDTO, parseObjectId, TestRequestError } from "@/lib/tests/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/tests/[testId]/attempts">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { testId } = await ctx.params;
    const id = parseObjectId(testId, "test id");
    const attempts = await (await userTestAttemptsColl()).find({ userId: auth.user._id, testId: id }).sort({ startedAt: -1 }).toArray();
    return NextResponse.json({ attempts: attempts.map(attemptDTO) });
  } catch (error) {
    if (error instanceof TestRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

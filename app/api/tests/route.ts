import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { testsColl, userTestAttemptsColl } from "@/lib/models/collections";
import type { TestDoc } from "@/lib/models/types";
import { TestFilterSchema, testDTO } from "@/lib/tests/service";

export async function GET(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const url = new URL(req.url);
  const parsed = TestFilterSchema.safeParse({
    level: url.searchParams.get("level") || undefined,
    skill: url.searchParams.get("skill") || undefined,
    type: url.searchParams.get("type") || undefined,
    status: url.searchParams.get("status") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid test filters" }, { status: 400 });

  const filter: Filter<TestDoc> = {};
  if (parsed.data.level) filter.level = parsed.data.level;
  if (parsed.data.skill) filter.skill = parsed.data.skill;
  if (parsed.data.type) filter.type = parsed.data.type;

  const [tests, attempts] = await Promise.all([
    (await testsColl()).find(filter).sort({ type: 1, level: 1, skill: 1 }).toArray(),
    (await userTestAttemptsColl()).find({ userId: auth.user._id, status: "completed" }).toArray(),
  ]);
  const byTest = new Map<string, { bestScore: number | null; completed: boolean }>();
  for (const attempt of attempts) {
    const id = attempt.testId.toString();
    const current = byTest.get(id) ?? { bestScore: null, completed: false };
    byTest.set(id, {
      completed: true,
      bestScore: Math.max(current.bestScore ?? 0, attempt.score ?? 0),
    });
  }
  const result = tests
    .map((test) => {
      const stat = byTest.get(test._id.toString());
      return testDTO(test, stat?.bestScore ?? null, stat?.completed ? "completed" : "new");
    })
    .filter((test) => !parsed.data.status || test.status === parsed.data.status);

  return NextResponse.json({ tests: result });
}

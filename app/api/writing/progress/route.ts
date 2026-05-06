import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { writingProgressDTO } from "@/lib/data/dto";
import { userWritingProgressColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const rows = await (await userWritingProgressColl())
    .find({ userId: auth.user._id })
    .sort({ updatedAt: -1 })
    .toArray();

  const totalAttempts = rows.reduce((acc, r) => acc + (r.attemptsCount ?? 0), 0);
  const completed = rows.filter((r) => r.status === "completed").length;
  const scoreSum = rows.reduce((acc, r) => acc + (r.bestScore ?? 0), 0);
  const avg = rows.length ? Math.round(scoreSum / rows.length) : 0;
  const weakAreas = aggregateWeakAreas(rows.flatMap((r) => r.weakAreas ?? []));

  return NextResponse.json({
    progress: rows.map(writingProgressDTO),
    summary: {
      total_tasks_started: rows.length,
      total_completed: completed,
      total_attempts: totalAttempts,
      average_best_score: avg,
      weak_areas: weakAreas,
    },
  });
}

function aggregateWeakAreas(items: string[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const raw of items) {
    const tag = raw.trim();
    if (!tag) continue;
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { userWritingProgressColl, userWritingSubmissionsColl, writingTasksColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const [tasksTotal, progressRows, latest] = await Promise.all([
    (await writingTasksColl()).countDocuments({}),
    (await userWritingProgressColl()).find({ userId: auth.user._id }).toArray(),
    (await userWritingSubmissionsColl()).find({ userId: auth.user._id, createdAt: { $exists: true } }).sort({ createdAt: -1 }).limit(1).toArray(),
  ]);
  const completed = progressRows.filter((row) => row.status === "completed").length;
  const weakAreas = [...new Set(latest.flatMap((row) => row.weakAreas))];

  return NextResponse.json({
    tasksTotal,
    completed,
    inProgress: progressRows.filter((row) => row.status === "in_progress").length,
    attemptsCount: progressRows.reduce((sum, row) => sum + row.attemptsCount, 0),
    lastScore: latest[0]?.score ?? null,
    weakAreas,
  });
}

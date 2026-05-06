import { NextRequest, NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { writingTaskDTO } from "@/lib/data/dto";
import { userWritingProgressColl, writingTasksColl } from "@/lib/models/collections";
import type { CEFRLevel, WritingTaskDoc, UserWritingProgressStatus } from "@/lib/models/types";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2"];
const STATUSES: UserWritingProgressStatus[] = ["new", "in_progress", "completed"];

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const url = new URL(req.url);
  const level = url.searchParams.get("level");
  const topic = url.searchParams.get("topic");
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("q");

  const filter: Filter<WritingTaskDoc> = {};
  if (level && LEVELS.includes(level as CEFRLevel)) filter.cefr_level = level as CEFRLevel;
  if (topic) filter.topic = topic;
  if (type) filter.type = type as WritingTaskDoc["type"];
  if (search && search.trim().length) {
    const re = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ title: re }, { topic: re }, { instructions: re }];
  }

  const [tasks, progressRows] = await Promise.all([
    (await writingTasksColl()).find(filter).sort({ cefr_level: 1, topic: 1, title: 1 }).limit(200).toArray(),
    (await userWritingProgressColl()).find({ userId: auth.user._id }).toArray(),
  ]);

  const progressByTaskId = new Map(progressRows.map((p) => [p.taskId.toString(), p]));

  let dtos = tasks.map((task) => writingTaskDTO(task, progressByTaskId.get(task._id.toString())));

  if (status && STATUSES.includes(status as UserWritingProgressStatus)) {
    dtos = dtos.filter((task) => {
      const current: UserWritingProgressStatus = task.progress?.status ?? "new";
      return current === status;
    });
  }

  const facets = buildFacets(tasks);

  return NextResponse.json({ tasks: dtos, facets });
}

function buildFacets(tasks: WritingTaskDoc[]) {
  const levels = new Set<string>();
  const topics = new Set<string>();
  const types = new Set<string>();
  for (const t of tasks) {
    if (t.cefr_level) levels.add(t.cefr_level);
    if (t.topic) topics.add(t.topic);
    if (t.type) types.add(t.type);
  }
  return {
    levels: [...levels].sort(),
    topics: [...topics].sort(),
    types: [...types].sort(),
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

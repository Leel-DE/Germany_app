import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { writingTaskDTO } from "@/lib/data/dto";
import { userWritingProgressColl, writingTasksColl } from "@/lib/models/collections";
import type { WritingTaskDoc } from "@/lib/models/types";
import { TaskFilterSchema } from "@/lib/writing/service";

export async function GET(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const url = new URL(req.url);
  const parsed = TaskFilterSchema.safeParse({
    level: url.searchParams.get("level") || undefined,
    topic: url.searchParams.get("topic") || undefined,
    type: url.searchParams.get("type") || undefined,
    status: url.searchParams.get("status") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid writing task filters" }, { status: 400 });

  const progressRows = await (await userWritingProgressColl()).find({ userId: auth.user._id }).toArray();
  const progressByTask = new Map(progressRows.map((row) => [row.taskId.toString(), row]));
  const filter: Filter<WritingTaskDoc> = {};
  if (parsed.data.level) filter.level = parsed.data.level;
  if (parsed.data.topic) filter.topic = parsed.data.topic;
  if (parsed.data.type) filter.type = parsed.data.type;

  let tasks = await (await writingTasksColl()).find(filter).sort({ level: 1, topic: 1, estimatedMinutes: 1 }).limit(100).toArray();
  if (parsed.data.status) {
    tasks = tasks.filter((task) => (progressByTask.get(task._id.toString())?.status ?? "new") === parsed.data.status);
  }

  return NextResponse.json({ tasks: tasks.map((task) => writingTaskDTO(task, progressByTask.get(task._id.toString()))) });
}

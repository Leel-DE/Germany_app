import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { writingTaskDTO } from "@/lib/data/dto";
import { userWritingProgressColl, writingTasksColl } from "@/lib/models/collections";

export async function GET(_req: Request, ctx: RouteContext<"/api/writing/tasks/[id]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const task = await (await writingTasksColl()).findOne({ _id: new ObjectId(id) });
  if (!task) return NextResponse.json({ error: "Writing task not found" }, { status: 404 });
  const progress = await (await userWritingProgressColl()).findOne({ userId: auth.user._id, taskId: task._id });

  return NextResponse.json({ task: writingTaskDTO(task, progress) });
}

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { writingDraftDTO, writingProgressDTO, writingTaskDTO } from "@/lib/data/dto";
import {
  userWritingDraftsColl,
  userWritingProgressColl,
  writingTasksColl,
} from "@/lib/models/collections";

export async function GET(_req: Request, ctx: RouteContext<"/api/writing/tasks/[id]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const objectId = new ObjectId(id);
  const [task, progress, draft] = await Promise.all([
    (await writingTasksColl()).findOne({ _id: objectId }),
    (await userWritingProgressColl()).findOne({ userId: auth.user._id, taskId: objectId }),
    (await userWritingDraftsColl()).findOne({ userId: auth.user._id, taskId: objectId }),
  ]);

  if (!task) return NextResponse.json({ error: "Writing task not found" }, { status: 404 });

  return NextResponse.json({
    task: writingTaskDTO(task, progress),
    progress: progress ? writingProgressDTO(progress) : null,
    draft: draft ? writingDraftDTO(draft) : null,
  });
}

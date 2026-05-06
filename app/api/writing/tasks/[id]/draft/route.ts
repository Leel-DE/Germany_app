import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { writingDraftDTO } from "@/lib/data/dto";
import { userWritingDraftsColl, writingTasksColl } from "@/lib/models/collections";

const DraftSchema = z.object({
  text: z.string().max(8000),
});

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/writing/tasks/[id]/draft">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const draft = await (await userWritingDraftsColl()).findOne({
    userId: auth.user._id,
    taskId: new ObjectId(id),
  });

  return NextResponse.json({ draft: draft ? writingDraftDTO(draft) : null });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/writing/tasks/[id]/draft">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const parsed = DraftSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid draft" }, { status: 400 });

  const taskObjectId = new ObjectId(id);
  const taskExists = await (await writingTasksColl()).countDocuments({ _id: taskObjectId }, { limit: 1 });
  if (!taskExists) return NextResponse.json({ error: "Writing task not found" }, { status: 404 });

  const text = parsed.data.text.slice(0, 8000);
  const now = new Date();

  if (text.trim().length === 0) {
    await (await userWritingDraftsColl()).deleteOne({ userId: auth.user._id, taskId: taskObjectId });
    return NextResponse.json({ draft: null });
  }

  const coll = await userWritingDraftsColl();
  await coll.updateOne(
    { userId: auth.user._id, taskId: taskObjectId },
    {
      $set: { text, updatedAt: now },
      $setOnInsert: {
        _id: new ObjectId(),
        userId: auth.user._id,
        taskId: taskObjectId,
      },
    },
    { upsert: true }
  );

  const draft = await coll.findOne({ userId: auth.user._id, taskId: taskObjectId });
  return NextResponse.json({ draft: draft ? writingDraftDTO(draft) : null });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/writing/tasks/[id]/draft">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  await (await userWritingDraftsColl()).deleteOne({
    userId: auth.user._id,
    taskId: new ObjectId(id),
  });
  return NextResponse.json({ ok: true });
}

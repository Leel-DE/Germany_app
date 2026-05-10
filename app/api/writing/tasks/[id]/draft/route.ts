import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { userWritingDraftsColl } from "@/lib/models/collections";
import { DraftSchema, parseObjectId, saveDraft, WritingRequestError } from "@/lib/writing/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/writing/tasks/[id]/draft">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await ctx.params;
    const taskId = parseObjectId(id, "task id");
    const draft = await (await userWritingDraftsColl()).findOne({ userId: auth.user._id, taskId });
    return NextResponse.json({
      draft: draft
        ? { id: draft._id.toString(), taskId: draft.taskId.toString(), text: draft.text, updatedAt: draft.updatedAt.toISOString() }
        : null,
    });
  } catch (error) {
    if (error instanceof WritingRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/writing/tasks/[id]/draft">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const { id } = await ctx.params;
    const taskId = parseObjectId(id, "task id");
    const parsed = DraftSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid draft" }, { status: 400 });

    const draft = await saveDraft(auth.user, taskId, parsed.data.text);
    return NextResponse.json({
      draft: { id: draft?._id.toString(), taskId: taskId.toString(), text: draft?.text ?? "", updatedAt: draft?.updatedAt.toISOString() },
    });
  } catch (error) {
    if (error instanceof WritingRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

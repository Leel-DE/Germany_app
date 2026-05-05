import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { readingTextDTO } from "@/lib/data/dto";
import { readingTextsColl, userReadingProgressColl } from "@/lib/models/collections";

export async function GET(_req: Request, ctx: RouteContext<"/api/reading/texts/[id]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid reading text id" }, { status: 400 });

  const textId = new ObjectId(id);
  const text = await (await readingTextsColl()).findOne({
    _id: textId,
    $or: [{ isSystem: true }, { createdBy: auth.user._id }],
  });
  if (!text) return NextResponse.json({ error: "Reading text not found" }, { status: 404 });

  const progress = await (await userReadingProgressColl()).findOne({ userId: auth.user._id, textId });

  return NextResponse.json({ text: readingTextDTO(text, progress) });
}

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { vocabularyDTO } from "@/lib/data/dto";
import { srsReviewsColl, userVocabProgressColl, vocabularyColl } from "@/lib/models/collections";

const PatchSchema = z.object({
  translation_ru: z.string().min(1).max(240).optional(),
  topic: z.string().max(80).optional(),
  example_de: z.string().max(300).optional(),
  example_ru: z.string().max(300).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/vocabulary/[id]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid word id" }, { status: 400 });

  const word = await (await vocabularyColl()).findOne({
    _id: new ObjectId(id),
    $or: [{ isSystem: true }, { createdBy: auth.user._id }],
  });
  if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
  return NextResponse.json({ word: vocabularyDTO(word) });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/vocabulary/[id]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid word id" }, { status: 400 });

  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });

  const coll = await vocabularyColl();
  const result = await coll.findOneAndUpdate(
    { _id: new ObjectId(id), isSystem: false, createdBy: auth.user._id },
    { $set: parsed.data },
    { returnDocument: "after" }
  );
  if (!result) return NextResponse.json({ error: "Editable word not found" }, { status: 404 });

  return NextResponse.json({ word: vocabularyDTO(result) });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/vocabulary/[id]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid word id" }, { status: 400 });

  const wordId = new ObjectId(id);
  const vocab = await vocabularyColl();
  const word = await vocab.findOne({ _id: wordId });

  if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });

  if (!word.isSystem) {
    if (!word.createdBy || !word.createdBy.equals(auth.user._id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Promise.all([
      vocab.deleteOne({ _id: wordId, createdBy: auth.user._id }),
      (await userVocabProgressColl()).deleteMany({ userId: auth.user._id, wordId }),
      (await srsReviewsColl()).deleteMany({ userId: auth.user._id, wordId }),
    ]);

    return NextResponse.json({ ok: true, deleted: "word" });
  }

  const now = new Date();
  await Promise.all([
    (await userVocabProgressColl()).updateOne(
      { userId: auth.user._id, wordId },
      {
        $set: {
          status: "suspended",
          lastReviewedAt: now,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          userId: auth.user._id,
          wordId,
          easeFactor: 2.5,
          intervalDays: 0,
          repetitionCount: 0,
          dueDate: now.toISOString().slice(0, 10),
          correctCount: 0,
          wrongCount: 0,
          addedAt: now,
        },
      },
      { upsert: true }
    ),
    (await srsReviewsColl()).deleteMany({ userId: auth.user._id, wordId }),
  ]);

  return NextResponse.json({ ok: true, deleted: "progress" });
}

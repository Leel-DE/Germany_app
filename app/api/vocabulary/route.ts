import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { vocabularyDTO } from "@/lib/data/dto";
import { userVocabProgressColl, vocabularyColl } from "@/lib/models/collections";
import type { CEFRLevel, WordType } from "@/lib/models/types";

const CreateSchema = z.object({
  german: z.string().min(1).max(120),
  translation_ru: z.string().min(1).max(240),
  article: z.string().max(8).optional(),
  plural: z.string().max(80).optional(),
  word_type: z.enum(["noun", "verb", "adjective", "adverb", "phrase", "preposition", "conjunction"]),
  cefr_level: z.enum(["A1", "A2", "B1", "B2"]),
  topic: z.string().max(80).optional(),
  example_de: z.string().max(300).optional(),
  example_ru: z.string().max(300).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const params = req.nextUrl.searchParams;
  const search = params.get("q")?.trim();
  const level = params.get("level") as CEFRLevel | null;
  const topic = params.get("topic")?.trim();
  const type = params.get("type") as WordType | null;

  const filter: Record<string, unknown> = {
    $or: [{ isSystem: true }, { createdBy: auth.user._id }],
  };
  if (level && ["A1", "A2", "B1", "B2"].includes(level)) filter.cefr_level = level;
  if (topic) filter.topic = topic;
  if (type) filter.word_type = type;
  if (search) {
    filter.$and = [{
      $or: [
        { german: { $regex: escapeRegex(search), $options: "i" } },
        { translation_ru: { $regex: escapeRegex(search), $options: "i" } },
      ],
    }];
  }

  const words = await (await vocabularyColl()).find(filter).sort({ frequency_rank: 1, german: 1 }).limit(200).toArray();
  const progressRows = await (await userVocabProgressColl())
    .find({ userId: auth.user._id, wordId: { $in: words.map((word) => word._id) } })
    .toArray();
  const progressByWord = new Map(progressRows.map((row) => [row.wordId.toString(), row]));
  const visibleWords = words.filter((word) => progressByWord.get(word._id.toString())?.status !== "suspended");

  return NextResponse.json({
    words: visibleWords.map((word) => vocabularyDTO(word, progressByWord.get(word._id.toString()))),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid vocabulary item" }, { status: 400 });
  }

  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    ...parsed.data,
    isSystem: false,
    createdBy: auth.user._id,
    createdAt: now,
  };
  await (await vocabularyColl()).insertOne(doc);
  await (await userVocabProgressColl()).insertOne({
    _id: new ObjectId(),
    userId: auth.user._id,
    wordId: doc._id,
    status: "new",
    easeFactor: 2.5,
    intervalDays: 0,
    repetitionCount: 0,
    dueDate: now.toISOString().slice(0, 10),
    lastReviewedAt: null,
    correctCount: 0,
    wrongCount: 0,
    addedAt: now,
  });
  return NextResponse.json({ word: vocabularyDTO(doc) }, { status: 201 });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

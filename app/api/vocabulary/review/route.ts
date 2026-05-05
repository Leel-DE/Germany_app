import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { ensureInitialVocabulary, todayKey } from "@/lib/data/personalization";
import { userVocabProgressColl, vocabularyColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  await ensureInitialVocabulary(auth.user);

  const dueDate = todayKey();
  const progressRows = await (await userVocabProgressColl())
    .find({ userId: auth.user._id, dueDate: { $lte: dueDate }, status: { $ne: "suspended" } })
    .limit(30)
    .toArray();

  const words = await (await vocabularyColl())
    .find({ _id: { $in: progressRows.map((row) => row.wordId) } })
    .toArray();
  const wordsById = new Map(words.map((word) => [word._id.toString(), word]));

  return NextResponse.json({
    cards: progressRows
      .map((progress) => {
        const word = wordsById.get(progress.wordId.toString());
        if (!word) return null;
        return {
          id: word._id.toString(),
          progressId: progress._id.toString(),
          german: word.german,
          article: word.article,
          plural: word.plural,
          translation_ru: word.translation_ru,
          example_de: word.example_de,
          example_ru: word.example_ru,
          word_type: word.word_type,
          easeFactor: progress.easeFactor,
          intervalDays: progress.intervalDays,
          repetitionCount: progress.repetitionCount,
        };
      })
      .filter(Boolean),
  });
}

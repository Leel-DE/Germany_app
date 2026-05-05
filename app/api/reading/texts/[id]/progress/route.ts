import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { readingProgressDTO } from "@/lib/data/dto";
import { readingTextsColl, userReadingProgressColl } from "@/lib/models/collections";
import type { MiniTestQuestion } from "@/types";

const SubmitSchema = z.object({
  answers: z.record(z.coerce.number().int().min(0), z.number().int().min(0)),
  startedAt: z.string().datetime().optional(),
});

export async function GET(_req: Request, ctx: RouteContext<"/api/reading/texts/[id]/progress">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid reading text id" }, { status: 400 });

  const progress = await (await userReadingProgressColl()).findOne({
    userId: auth.user._id,
    textId: new ObjectId(id),
  });

  return NextResponse.json({ progress: progress ? readingProgressDTO(progress) : null });
}

export async function POST(req: Request, ctx: RouteContext<"/api/reading/texts/[id]/progress">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid reading text id" }, { status: 400 });

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid quiz submission" }, { status: 400 });
  }

  const textId = new ObjectId(id);
  const text = await (await readingTextsColl()).findOne({
    _id: textId,
    $or: [{ isSystem: true }, { createdBy: auth.user._id }],
  });
  if (!text) return NextResponse.json({ error: "Reading text not found" }, { status: 404 });

  const questions = normalizeQuestions(text.questions);
  if (questions.length === 0) {
    return NextResponse.json({ error: "This reading text has no quiz questions." }, { status: 400 });
  }

  const answers = Object.fromEntries(
    Object.entries(parsed.data.answers).map(([key, value]) => [String(key), value])
  );
  const checked = questions.map((question, index) => ({
    questionIndex: index,
    selected: answers[String(index)],
    correct: answers[String(index)] === question.answer,
    answer: question.answer,
  }));
  const correctCount = checked.filter((item) => item.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const now = new Date();

  const result = await (await userReadingProgressColl()).findOneAndUpdate(
    { userId: auth.user._id, textId },
    {
      $set: {
        status: "completed",
        score,
        correctCount,
        questionsTotal: questions.length,
        answers,
        startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : null,
        completedAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: new ObjectId(),
        userId: auth.user._id,
        textId,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  if (!result) return NextResponse.json({ error: "Could not save reading progress" }, { status: 502 });

  return NextResponse.json({
    progress: readingProgressDTO(result),
    checked,
  });
}

function normalizeQuestions(value: unknown): MiniTestQuestion[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = item as Partial<MiniTestQuestion>;
      if (typeof question.question !== "string") return null;
      if (!Array.isArray(question.options)) return null;
      if (typeof question.answer !== "number") return null;
      return {
        question: question.question,
        options: question.options.filter((option): option is string => typeof option === "string"),
        answer: question.answer,
        explanation: typeof question.explanation === "string" ? question.explanation : "",
      };
    })
    .filter((question): question is MiniTestQuestion => {
      return question !== null && question.options.length > 0;
    });
}

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { detectLevel, generateDailyPlan } from "@/lib/data/personalization";
import { placementQuestionsColl, userTestResultsColl, usersColl } from "@/lib/models/collections";
import { toPublicUser } from "@/lib/models/types";

const SubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selected: z.number().int().min(0),
  })),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid placement test payload" }, { status: 400 });
  }

  const ids = parsed.data.answers
    .filter((answer) => ObjectId.isValid(answer.questionId))
    .map((answer) => new ObjectId(answer.questionId));

  const questions = await (await placementQuestionsColl()).find({ _id: { $in: ids } }).toArray();
  const byId = new Map(questions.map((question) => [question._id.toString(), question]));

  const checked = parsed.data.answers
    .map((answer) => {
      const question = byId.get(answer.questionId);
      return question
        ? {
            questionId: answer.questionId,
            selected: answer.selected,
            correct: answer.selected === question.answer,
            area: question.area,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const correctCount = checked.filter((answer) => answer.correct).length;
  const score = checked.length ? Math.round((correctCount / checked.length) * 100) : 0;
  const detectedLevel = detectLevel(score);
  const weakAreas = detectWeakAreas(checked);

  const results = await userTestResultsColl();
  await results.insertOne({
    _id: new ObjectId(),
    userId: auth.user._id,
    testType: "placement",
    questionsTotal: checked.length,
    correctCount,
    score,
    detectedLevel,
    weakAreas,
    answers: checked.map(({ questionId, selected, correct }) => ({ questionId, selected, correct })),
    takenAt: new Date(),
  });

  const users = await usersColl();
  await users.updateOne(
    { _id: auth.user._id },
    {
      $set: {
        currentGermanLevel: detectedLevel,
        weakGrammarAreas: weakAreas,
        placementTestCompleted: true,
        updatedAt: new Date(),
      },
    }
  );

  const user = await users.findOne({ _id: auth.user._id });
  if (user) await generateDailyPlan(user);

  return NextResponse.json({
    score,
    correctCount,
    questionsTotal: checked.length,
    detectedLevel,
    weakAreas,
    recommendedPlan: {
      level: detectedLevel,
      focusAreas: weakAreas,
      firstStep: "Open today's plan and start with SRS review.",
    },
    user: user ? toPublicUser(user) : null,
  });
}

function detectWeakAreas(answers: { area: string; correct: boolean }[]) {
  const grouped = new Map<string, { total: number; correct: number }>();
  for (const answer of answers) {
    const row = grouped.get(answer.area) ?? { total: 0, correct: 0 };
    row.total += 1;
    if (answer.correct) row.correct += 1;
    grouped.set(answer.area, row);
  }
  return [...grouped.entries()]
    .filter(([, row]) => row.total > 0 && row.correct / row.total < 0.6)
    .map(([area]) => area)
    .slice(0, 8);
}

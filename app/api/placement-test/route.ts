import { NextResponse } from "next/server";
import { placementQuestionsColl } from "@/lib/models/collections";

export async function GET() {
  const questions = await (await placementQuestionsColl())
    .find({})
    .sort({ order: 1 })
    .toArray();

  return NextResponse.json({
    questions: questions.map((q) => ({
      id: q._id.toString(),
      order: q.order,
      question_de: q.question_de,
      question_ru: q.question_ru,
      type: q.type,
      options: q.options,
      cefr_level: q.cefr_level,
      skill: q.skill,
      area: q.area,
    })),
  });
}

import { NextResponse } from "next/server";
import { onboardingQuestionsColl } from "@/lib/models/collections";

export async function GET() {
  const questions = await (await onboardingQuestionsColl())
    .find({})
    .sort({ order: 1 })
    .toArray();

  return NextResponse.json({
    questions: questions.map(({ _id, ...question }) => ({
      id: _id.toString(),
      ...question,
    })),
  });
}

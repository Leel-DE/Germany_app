import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { generateDailyPlan } from "@/lib/data/personalization";
import { toPublicUser } from "@/lib/models/types";
import { usersColl } from "@/lib/models/collections";

const SubmitSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid onboarding payload" }, { status: 400 });
  }

  const answers = parsed.data.answers;
  const update = {
    learningGoals: asStringArray(answers.learning_goals),
    profession: asString(answers.profession),
    studyPurpose: asString(answers.study_purpose),
    weakSkills: asStringArray(answers.weak_skills),
    preferredTopics: asStringArray(answers.preferred_topics),
    preferredFormats: asStringArray(answers.preferred_formats),
    dailyStudyMinutes: asBoundedNumber(answers.daily_study_minutes, 10, 60, 30),
    studyDaysPerWeek: asBoundedNumber(answers.study_days_per_week, 1, 7, 5),
    targetGermanLevel: asLevel(answers.target_german_level, auth.user.targetGermanLevel),
    onboardingCompleted: true,
    updatedAt: new Date(),
  };

  const users = await usersColl();
  await users.updateOne({ _id: auth.user._id }, { $set: update });
  const user = await users.findOne({ _id: auth.user._id });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await generateDailyPlan(user);

  return NextResponse.json({ user: toPublicUser(user) });
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asBoundedNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function asLevel(value: unknown, fallback: "A1" | "A2" | "B1" | "B2") {
  return value === "A1" || value === "A2" || value === "B1" || value === "B2" ? value : fallback;
}

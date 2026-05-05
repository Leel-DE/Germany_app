import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { enrichedDailyPlanDTO } from "@/lib/data/dailyPlanFlow";
import { generateDailyPlan } from "@/lib/data/personalization";

export async function POST() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const plan = await generateDailyPlan(auth.user);
  return NextResponse.json({ plan: await enrichedDailyPlanDTO(plan) });
}

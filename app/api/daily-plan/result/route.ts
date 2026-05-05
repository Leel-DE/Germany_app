import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { planResultDTO } from "@/lib/data/dailyPlanFlow";
import { generateDailyPlan, todayKey } from "@/lib/data/personalization";
import { dailyPlansColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const plan = await (await dailyPlansColl()).findOne({ userId: auth.user._id, planDate: todayKey() })
    ?? await generateDailyPlan(auth.user);

  return NextResponse.json({ result: planResultDTO(plan, auth.user.streakCount ?? 0) });
}

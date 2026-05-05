import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { getActiveTask } from "@/lib/data/dailyPlanFlow";
import { generateDailyPlan, todayKey } from "@/lib/data/personalization";
import { dailyPlansColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const plan = await (await dailyPlansColl()).findOne({ userId: auth.user._id, planDate: todayKey() })
    ?? await generateDailyPlan(auth.user);
  const activeTask = getActiveTask(plan);

  return NextResponse.json({
    status: plan.status,
    completed: plan.stepsCompleted,
    total: plan.steps.length,
    progress_percent: plan.progressPercent ?? (plan.steps.length ? Math.round((plan.stepsCompleted / plan.steps.length) * 100) : 0),
    active_task_id: activeTask?.id ?? null,
  });
}

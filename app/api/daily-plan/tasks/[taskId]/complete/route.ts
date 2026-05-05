import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { completeTask, enrichedDailyPlanDTO, FlowError } from "@/lib/data/dailyPlanFlow";
import { generateDailyPlan, todayKey } from "@/lib/data/personalization";
import { dailyPlansColl } from "@/lib/models/collections";

export async function PATCH(req: Request, ctx: RouteContext<"/api/daily-plan/tasks/[taskId]/complete">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { taskId } = await ctx.params;
  const plan = await (await dailyPlansColl()).findOne({ userId: auth.user._id, planDate: todayKey() })
    ?? await generateDailyPlan(auth.user);
  const payload = await req.json().catch(() => ({}));

  try {
    const updated = await completeTask(auth.user, plan, taskId, payload);
    return NextResponse.json({ plan: await enrichedDailyPlanDTO(updated) });
  } catch (error) {
    if (error instanceof FlowError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

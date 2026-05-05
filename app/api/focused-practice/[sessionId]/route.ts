import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { focusedPracticeDTO, getFocusedPracticeSession } from "@/lib/focused-practice/service";

export async function GET(_req: Request, ctx: RouteContext<"/api/focused-practice/[sessionId]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { sessionId } = await ctx.params;
  const session = await getFocusedPracticeSession(auth.user, sessionId);
  if (!session) return NextResponse.json({ error: "Focused practice session not found" }, { status: 404 });

  return NextResponse.json({ session: focusedPracticeDTO(session) });
}

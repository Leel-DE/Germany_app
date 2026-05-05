import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import {
  completeFocusedPractice,
  focusedPracticeDTO,
  getFocusedPracticeSession,
} from "@/lib/focused-practice/service";

const CompleteSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/focused-practice/[sessionId]/complete">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { sessionId } = await ctx.params;
  const session = await getFocusedPracticeSession(auth.user, sessionId);
  if (!session) return NextResponse.json({ error: "Focused practice session not found" }, { status: 404 });

  const parsed = CompleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid focused practice result" }, { status: 400 });

  const completed = await completeFocusedPractice(auth.user, session, parsed.data.answers);
  return NextResponse.json({ session: focusedPracticeDTO(completed) });
}

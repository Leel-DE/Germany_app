import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { getCurrentRecommendation, startFocusedPractice } from "@/lib/focused-practice/service";

const StartSchema = z.object({
  topic: z.string().min(1).max(80).optional(),
  type: z.enum(["grammar", "vocabulary", "reading", "mixed"]).optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = StartSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid focused practice payload" }, { status: 400 });

  const recommendation = await getCurrentRecommendation(auth.user);
  const topic = parsed.data.topic ?? recommendation.target.topic;
  const type = parsed.data.type ?? recommendation.target.practiceType;
  const { session, redirectUrl } = await startFocusedPractice(auth.user, topic, type);

  return NextResponse.json({
    sessionId: session._id.toString(),
    redirectUrl,
  }, { status: 201 });
}

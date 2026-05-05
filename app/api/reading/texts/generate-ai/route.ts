import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/currentUser";
import { generateReadingTextWithAI, getReadingAIErrorMessage } from "@/lib/reading/aiGenerate";
import { getReadingProfile } from "@/lib/reading/personalization";
import type { CEFRLevel } from "@/types";

const BodySchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2"]).optional(),
  topic: z.string().min(2).max(80).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid generation request" }, { status: 400 });
  }

  try {
    const profile = getReadingProfile(auth.user);
    const text = await generateReadingTextWithAI(profile, {
      level: parsed.data.level as CEFRLevel | undefined,
      topic: parsed.data.topic,
    });

    return NextResponse.json({ text }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getReadingAIErrorMessage(error) }, { status: 502 });
  }
}

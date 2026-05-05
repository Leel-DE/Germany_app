import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { AIProviderError } from "@/lib/ai/server";
import { getClientKey, rateLimit } from "@/lib/auth/rateLimit";
import { generateVocabularyWithAI, getAIErrorMessage } from "@/lib/vocabulary/aiGenerate";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const rl = rateLimit(getClientKey(req, `vocabulary-ai:${auth.user._id.toString()}`), 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Generation limit reached. Try again in ${rl.retryAfterSec} seconds.` },
      { status: 429 }
    );
  }

  try {
    const words = await generateVocabularyWithAI(auth.user);
    return NextResponse.json({
      words,
      created: words.length,
      skipped: 20 - words.length,
    });
  } catch (error) {
    const status = error instanceof AIProviderError && error.status === 429 ? 429 : 502;
    return NextResponse.json({ error: getAIErrorMessage(error) }, { status });
  }
}

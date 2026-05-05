import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { grammarDTO } from "@/lib/data/dto";
import { grammarTopicsColl, userGrammarProgressColl } from "@/lib/models/collections";

export async function GET(_req: Request, ctx: RouteContext<"/api/grammar-lessons/[slug]">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { slug } = await ctx.params;
  const topic = await (await grammarTopicsColl()).findOne({ slug, isPublished: true });
  if (!topic) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const progress = await (await userGrammarProgressColl()).findOne({
    userId: auth.user._id,
    topicId: topic._id,
  });

  return NextResponse.json({ lesson: grammarDTO(topic, progress) });
}

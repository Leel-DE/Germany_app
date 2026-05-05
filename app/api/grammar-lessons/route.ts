import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { grammarDTO } from "@/lib/data/dto";
import { grammarTopicsColl, userGrammarProgressColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const topics = await (await grammarTopicsColl())
    .find({ isPublished: true })
    .sort({ order_index: 1 })
    .toArray();
  const progressRows = await (await userGrammarProgressColl())
    .find({ userId: auth.user._id, topicId: { $in: topics.map((topic) => topic._id) } })
    .toArray();
  const progressByTopic = new Map(progressRows.map((row) => [row.topicId.toString(), row]));

  return NextResponse.json({
    lessons: topics.map((topic) => grammarDTO(topic, progressByTopic.get(topic._id.toString()))),
  });
}

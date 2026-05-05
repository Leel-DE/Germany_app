import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { writingTaskDTO } from "@/lib/data/dto";
import { writingTasksColl } from "@/lib/models/collections";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const filter = auth.user.preferredTopics.length
    ? { $or: [{ topic: { $in: auth.user.preferredTopics } }, { cefr_level: auth.user.currentGermanLevel }] }
    : {};
  const tasks = await (await writingTasksColl()).find(filter).sort({ cefr_level: 1, topic: 1 }).limit(50).toArray();

  return NextResponse.json({ tasks: tasks.map(writingTaskDTO) });
}

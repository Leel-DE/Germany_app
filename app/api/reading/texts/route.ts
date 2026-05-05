import { NextRequest, NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { requireUser } from "@/lib/auth/currentUser";
import { readingTextDTO } from "@/lib/data/dto";
import { readingTextsColl } from "@/lib/models/collections";
import type { ReadingTextDoc } from "@/lib/models/types";
import { getReadingProfile, personalizeReadingTexts } from "@/lib/reading/personalization";
import type { CEFRLevel } from "@/types";

const LEVELS = new Set(["A1", "A2", "B1", "B2"]);

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const params = req.nextUrl.searchParams;
  const level = params.get("level");
  const topic = params.get("topic")?.trim();
  const q = params.get("q")?.trim();
  const personalized = params.get("personalized") !== "false";

  const filter: Filter<ReadingTextDoc> = {
    $or: [{ isSystem: true }, { createdBy: auth.user._id }],
  };
  if (level && LEVELS.has(level)) filter.cefr_level = level as CEFRLevel;
  if (topic) filter.topic = topic;
  if (q) {
    filter.$and = [{
      $or: [
        { title: { $regex: escapeRegex(q), $options: "i" } },
        { content: { $regex: escapeRegex(q), $options: "i" } },
        { topic: { $regex: escapeRegex(q), $options: "i" } },
      ],
    }];
  }

  const coll = await readingTextsColl();
  const docs = await coll.find(filter).sort({ cefr_level: 1, createdAt: -1 }).limit(100).toArray();
  const allTopics = await coll.distinct("topic", { $or: [{ isSystem: true }, { createdBy: auth.user._id }] });
  const profile = getReadingProfile(auth.user);
  const texts = docs.map((doc) => readingTextDTO(doc));
  const visibleTexts = personalized ? personalizeReadingTexts(texts, profile) : texts;

  return NextResponse.json({
    texts: visibleTexts,
    topics: allTopics.filter((item): item is string => typeof item === "string").sort(),
    profile: {
      currentLevel: profile.currentLevel,
      targetLevel: profile.targetLevel,
      profession: profile.profession ?? null,
      weakAreas: profile.weakAreas,
      preferredTopics: profile.preferredTopics,
    },
  });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

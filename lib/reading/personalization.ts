import type { UserDoc } from "@/lib/models/types";
import type { CEFRLevel, ReadingText } from "@/types";

const LEVEL_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2"];

export interface ReadingProfile {
  userId: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  profession?: string;
  weakAreas: string[];
  preferredTopics: string[];
}

export function getReadingProfile(user: UserDoc): ReadingProfile {
  return {
    userId: user._id.toString(),
    currentLevel: user.currentGermanLevel,
    targetLevel: user.targetGermanLevel,
    profession: user.profession,
    weakAreas: [...new Set([...(user.weakSkills ?? []), ...(user.weakGrammarAreas ?? [])])],
    preferredTopics: user.preferredTopics ?? [],
  };
}

export function personalizeReadingTexts(texts: ReadingText[], profile: ReadingProfile) {
  return texts
    .map((text) => {
      const score = scoreReadingText(text, profile);
      return {
        ...text,
        recommended: score >= 20,
        recommendation_score: score,
        recommendation_reason: getRecommendationReason(text, profile, score),
      };
    })
    .sort((a, b) => {
      if (b.recommendation_score !== a.recommendation_score) {
        return b.recommendation_score - a.recommendation_score;
      }
      return LEVEL_ORDER.indexOf(a.cefr_level) - LEVEL_ORDER.indexOf(b.cefr_level);
    });
}

function scoreReadingText(text: ReadingText, profile: ReadingProfile) {
  let score = 0;
  const textLevelIndex = LEVEL_ORDER.indexOf(text.cefr_level);
  const currentIndex = LEVEL_ORDER.indexOf(profile.currentLevel);
  const targetIndex = LEVEL_ORDER.indexOf(profile.targetLevel);

  if (textLevelIndex === currentIndex) score += 30;
  if (textLevelIndex === Math.min(targetIndex, currentIndex + 1)) score += 22;
  if (text.topic && profile.preferredTopics.some((topic) => sameTopic(topic, text.topic))) score += 18;
  if (text.topic && profile.weakAreas.some((area) => sameTopic(area, text.topic))) score += 16;
  if (profile.profession && matchesProfession(text, profile.profession)) score += 14;
  if ((text.questions?.length ?? 0) > 0) score += 8;
  return score;
}

function getRecommendationReason(text: ReadingText, profile: ReadingProfile, score: number) {
  if (score < 20) return null;
  if (profile.profession && matchesProfession(text, profile.profession)) return `Relevant to ${profile.profession}`;
  if (profile.weakAreas.some((area) => sameTopic(area, text.topic))) return "Matches a weak area";
  if (profile.preferredTopics.some((topic) => sameTopic(topic, text.topic))) return "Matches your preferred topics";
  if (text.cefr_level === profile.currentLevel) return "Fits your current level";
  if (text.cefr_level === profile.targetLevel) return "Builds toward your target level";
  return "Recommended for your profile";
}

function matchesProfession(text: ReadingText, profession: string) {
  const haystack = `${text.title} ${text.topic} ${text.content}`.toLowerCase();
  return profession
    .toLowerCase()
    .split(/[\s,;/.-]+/)
    .filter((part) => part.length >= 4)
    .some((part) => haystack.includes(part));
}

function sameTopic(a: string, b: string) {
  const left = normalizeTopic(a);
  const right = normalizeTopic(b);
  return left.includes(right) || right.includes(left);
}

function normalizeTopic(value: string) {
  return value.toLowerCase().replace(/[_-]+/g, " ").trim();
}

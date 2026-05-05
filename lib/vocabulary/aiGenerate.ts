import { ObjectId } from "mongodb";
import { z } from "zod";
import { generateAIText, AIProviderError } from "@/lib/ai/server";
import { vocabularyDTO } from "@/lib/data/dto";
import { todayKey } from "@/lib/data/personalization";
import { userVocabProgressColl, vocabularyColl } from "@/lib/models/collections";
import type { CEFRLevel, UserDoc, VocabularyDoc, WordType } from "@/lib/models/types";

const WORD_TYPES = ["noun", "verb", "adjective", "adverb", "phrase", "preposition", "conjunction"] as const;

const AIWordSchema = z.object({
  german: z.string().min(1).max(120),
  russianTranslation: z.string().min(1).max(240),
  englishTranslation: z.string().min(1).max(240).optional(),
  article: z.string().max(8).optional().nullable(),
  plural: z.string().max(80).optional().nullable(),
  partOfSpeech: z.enum(WORD_TYPES),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2"]),
  topic: z.string().min(1).max(80),
  exampleSentence: z.string().min(1).max(300),
  exampleTranslationRu: z.string().min(1).max(300),
  exampleTranslationEn: z.string().min(1).max(300).optional(),
  notes: z.string().max(500).optional(),
  grammarInfo: z.string().max(500).optional(),
  frequencyLevel: z.enum(["low", "medium", "high"]),
});

const AIResponseSchema = z.object({
  words: z.array(AIWordSchema).min(1).max(30),
});

type AIWord = z.infer<typeof AIWordSchema>;

const VOCABULARY_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    words: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          german: { type: "string", description: "German word or phrase without article prefix." },
          russianTranslation: { type: "string", description: "Russian translation." },
          englishTranslation: { type: "string", description: "English translation." },
          article: { type: ["string", "null"], description: "der, die, or das for nouns; null otherwise." },
          plural: { type: ["string", "null"], description: "Plural form for nouns; null otherwise." },
          partOfSpeech: { type: "string", enum: [...WORD_TYPES] },
          cefrLevel: { type: "string", enum: ["A1", "A2", "B1", "B2"] },
          topic: { type: "string", description: "Short practical topic name." },
          exampleSentence: { type: "string", description: "Natural German example sentence." },
          exampleTranslationRu: { type: "string", description: "Russian translation of the example." },
          exampleTranslationEn: { type: "string", description: "English translation of the example." },
          notes: { type: "string", description: "Short learner note in Russian." },
          grammarInfo: { type: "string", description: "Short grammar note in Russian." },
          frequencyLevel: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: [
          "german",
          "russianTranslation",
          "englishTranslation",
          "article",
          "plural",
          "partOfSpeech",
          "cefrLevel",
          "topic",
          "exampleSentence",
          "exampleTranslationRu",
          "exampleTranslationEn",
          "notes",
          "grammarInfo",
          "frequencyLevel",
        ],
        propertyOrdering: [
          "german",
          "russianTranslation",
          "englishTranslation",
          "article",
          "plural",
          "partOfSpeech",
          "cefrLevel",
          "topic",
          "exampleSentence",
          "exampleTranslationRu",
          "exampleTranslationEn",
          "notes",
          "grammarInfo",
          "frequencyLevel",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["words"],
  propertyOrdering: ["words"],
  additionalProperties: false,
};

export async function generateVocabularyWithAI(user: UserDoc) {
  const existing = await getVisibleGermanSet(user);
  const unique: AIWord[] = [];
  let lastError: unknown;

  for (let attempt = 0; unique.length < 20 && attempt < 8; attempt += 1) {
    try {
      const requestedCount = Math.min(5, 20 - unique.length);
      const text = await generateAIText({
        system: "You generate production-quality German vocabulary data. Return only valid JSON. No markdown.",
        messages: [{ role: "user", content: buildPrompt(user, [...existing].slice(0, 150), requestedCount) }],
        maxTokens: 2500,
        responseMimeType: "application/json",
        responseJsonSchema: VOCABULARY_RESPONSE_SCHEMA,
      });

      const parsed = AIResponseSchema.safeParse(parseJson(text));
      if (!parsed.success) {
        throw new Error("AI returned invalid vocabulary JSON.");
      }

      const candidates = dedupe(
        parsed.data.words
          .map(normalizeAIWord)
          .filter((word): word is AIWord => Boolean(word))
          .filter((word) => !existing.has(normalizeGerman(word.german)))
      );

      for (const word of candidates) {
        if (unique.length >= 20) break;
        const key = normalizeGerman(word.german);
        if (existing.has(key)) continue;
        existing.add(key);
        unique.push(word);
      }
    } catch (error) {
      lastError = error;
      if (unique.length === 0 && attempt >= 2) break;
    }
  }

  if (unique.length === 0 && lastError) throw lastError;
  if (unique.length === 0) return [];

  const now = new Date();
  const docs: VocabularyDoc[] = unique.map((word) => ({
    _id: new ObjectId(),
    german: word.german,
    translation_ru: word.russianTranslation,
    translation_en: word.englishTranslation,
    article: word.partOfSpeech === "noun" ? word.article ?? undefined : undefined,
    plural: word.partOfSpeech === "noun" ? word.plural ?? undefined : undefined,
    word_type: word.partOfSpeech as WordType,
    cefr_level: word.cefrLevel as CEFRLevel,
    topic: word.topic,
    example_de: word.exampleSentence,
    example_ru: word.exampleTranslationRu,
    notes: word.notes,
    grammarInfo: word.grammarInfo,
    frequencyLevel: word.frequencyLevel,
    isSystem: false,
    createdBy: user._id,
    createdAt: now,
  }));

  const vocab = await vocabularyColl();
  await vocab.insertMany(docs, { ordered: false });

  const progress = await userVocabProgressColl();
  await progress.insertMany(
    docs.map((word) => ({
      _id: new ObjectId(),
      userId: user._id,
      wordId: word._id,
      status: "new" as const,
      easeFactor: 2.5,
      intervalDays: 0,
      repetitionCount: 0,
      dueDate: todayKey(now),
      lastReviewedAt: null,
      correctCount: 0,
      wrongCount: 0,
      addedAt: now,
    })),
    { ordered: false }
  );

  return docs.map((word) => vocabularyDTO(word));
}

export function getAIErrorMessage(error: unknown) {
  if (error instanceof AIProviderError) return error.publicMessage;
  if (error instanceof Error) return error.message;
  return "Could not generate vocabulary.";
}

async function getVisibleGermanSet(user: UserDoc) {
  const words = await (await vocabularyColl())
    .find({ $or: [{ isSystem: true }, { createdBy: user._id }] }, { projection: { german: 1 } })
    .toArray();
  return new Set(words.map((word) => normalizeGerman(word.german)));
}

function buildPrompt(user: UserDoc, existingGermanWords: string[], count: number) {
  return JSON.stringify({
    task: `Generate exactly ${count} useful German vocabulary cards for this user.`,
    outputContract: {
      format: "JSON object",
      schema: {
        words: [{
          german: "string",
          russianTranslation: "string",
          englishTranslation: "string",
          article: "der|die|das only for nouns, otherwise null",
          plural: "plural form for nouns, otherwise null",
          partOfSpeech: WORD_TYPES,
          cefrLevel: "A1|A2|B1|B2",
          topic: "string",
          exampleSentence: "German sentence",
          exampleTranslationRu: "Russian translation",
          exampleTranslationEn: "English translation",
          notes: "short learner note",
          grammarInfo: "article/case/verb government/conjugation note",
          frequencyLevel: "low|medium|high",
        }],
      },
    },
    constraints: [
      "Return only JSON, no markdown.",
      "Use the user's currentGermanLevel unless a word is clearly one step easier.",
      "Do not include duplicates from existingGermanWords.",
      "Prefer practical words for living in Germany, work, documents, doctors, interviews, and onboarding topics.",
      "For nouns include article and plural.",
      "Keep examples natural and level-appropriate.",
    ],
    userProfile: {
      currentGermanLevel: user.currentGermanLevel,
      targetGermanLevel: user.targetGermanLevel,
      learningGoals: user.learningGoals,
      profession: user.profession,
      studyPurpose: user.studyPurpose,
      preferredTopics: user.preferredTopics,
      weakSkills: user.weakSkills,
      weakGrammarAreas: user.weakGrammarAreas,
      nativeLanguage: user.nativeLanguage,
    },
    existingGermanWords,
  });
}

function parseJson(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return normalizeParsedJson(JSON.parse(trimmed));
  } catch {
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) return normalizeParsedJson(JSON.parse(objectMatch[0]));

    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) return { words: JSON.parse(arrayMatch[0]) };

    throw new Error("AI did not return JSON.");
  }
}

function normalizeParsedJson(value: unknown): unknown {
  return Array.isArray(value) ? { words: value } : value;
}

function normalizeAIWord(word: AIWord): AIWord | null {
  const german = word.german.trim();
  if (!german) return null;
  if (word.partOfSpeech === "noun" && !["der", "die", "das"].includes(String(word.article))) return null;
  return {
    ...word,
    german,
    russianTranslation: word.russianTranslation.trim(),
    englishTranslation: word.englishTranslation?.trim(),
    article: word.article?.trim() || null,
    plural: word.plural?.trim() || null,
    topic: word.topic.trim(),
    exampleSentence: word.exampleSentence.trim(),
    exampleTranslationRu: word.exampleTranslationRu.trim(),
    exampleTranslationEn: word.exampleTranslationEn?.trim(),
    notes: word.notes?.trim(),
    grammarInfo: word.grammarInfo?.trim(),
  };
}

function dedupe(words: AIWord[]) {
  const seen = new Set<string>();
  return words.filter((word) => {
    const key = normalizeGerman(word.german);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeGerman(value: string) {
  return value
    .toLowerCase()
    .replace(/^(der|die|das)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

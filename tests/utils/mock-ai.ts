import type { Page } from "@playwright/test";
import { jsonResponse } from "./test-helpers";

export const mockAiWords = [
  {
    id: "ai-word-1",
    german: "die Bewerbung",
    translation_ru: "заявление",
    article: "die",
    word_type: "noun",
    cefr_level: "B1",
    topic: "Arbeit",
    example_de: "Ich schreibe eine Bewerbung.",
    is_system: false,
  },
  {
    id: "ai-word-2",
    german: "vorbereiten",
    translation_ru: "готовить",
    word_type: "verb",
    cefr_level: "B1",
    topic: "Arbeit",
    example_de: "Ich bereite mich auf das Gespräch vor.",
    is_system: false,
  },
];

export const mockWritingFeedback = {
  score: 86,
  estimatedLevel: "B1",
  summary: "Clear structure, understandable message, and only minor grammar issues.",
  correctedText: "Sehr geehrte Damen und Herren, ich moechte einen Termin vereinbaren.",
  improvedVersion: "Sehr geehrte Damen und Herren, ich moechte gerne einen Termin vereinbaren.",
  errors: [
    {
      type: "style",
      original: "will ein Termin",
      correct: "moechte einen Termin",
      explanationRu: "Для официального письма лучше использовать вежливую форму.",
      severity: "medium",
    },
  ],
  strengths: ["clear request", "polite tone"],
  suggestions: ["add a preferred date"],
  weakAreas: ["formal style"],
  usefulPhrases: ["Ich freue mich auf Ihre Antwort."],
};

export async function mockAiRoutes(page: Page) {
  await page.route("**/api/vocabulary/generate-ai", async (route) => {
    await route.fulfill(jsonResponse({ words: mockAiWords, created: mockAiWords.length }));
  });

  await page.route("**/api/reading/texts/generate-ai", async (route) => {
    await route.fulfill(jsonResponse({ text: mockReadingText }));
  });

  await page.route("**/api/ai/**", async (route) => {
    await route.fulfill(jsonResponse({ response: "Deterministic e2e AI response.", feedback: mockWritingFeedback }));
  });

  await page.route("**/api/writing/*/check", async (route) => {
    await route.fulfill(
      jsonResponse({
        submission: {
          id: "submission-1",
          attemptNumber: 1,
          score: mockWritingFeedback.score,
          estimatedLevel: mockWritingFeedback.estimatedLevel,
          weakAreas: mockWritingFeedback.weakAreas,
          createdAt: new Date("2026-05-09T10:00:00.000Z").toISOString(),
        },
        feedback: mockWritingFeedback,
      })
    );
  });
}

export const mockReadingText = {
  id: "reading-1",
  title: "Ein Termin beim Arzt",
  content: "Morgen habe ich einen Termin beim Arzt. Ich bringe meine Versicherungskarte mit.",
  cefr_level: "A2",
  topic: "Arzt",
  word_count: 13,
  read_time_min: 2,
  recommended: true,
  recommendation_reason: "Matches your health vocabulary goal.",
  questions: [
    {
      question: "Wohin geht die Person?",
      options: ["Zum Arzt", "Zur Bank", "Zum Bahnhof"],
      answer: 0,
      explanation: "Im Text steht: Termin beim Arzt.",
    },
  ],
};

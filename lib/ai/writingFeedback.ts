import { z } from "zod";
import { generateAIText } from "@/lib/ai/server";
import type { CEFRLevel, WritingFeedback, WritingTaskDoc, WritingError } from "@/lib/models/types";

const ERROR_TYPES = [
  "grammar",
  "vocabulary",
  "word_order",
  "article",
  "case",
  "spelling",
  "style",
] as const;

const SEVERITIES = ["low", "medium", "high"] as const;

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

const WritingErrorSchema = z.object({
  type: z.enum(ERROR_TYPES),
  original: z.string().min(1).max(400),
  correct: z.string().min(1).max(400),
  explanationRu: z.string().min(1).max(800),
  severity: z.enum(SEVERITIES),
});

const WritingFeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  estimatedLevel: z.enum(LEVELS),
  summary: z.string().min(1).max(1500),
  correctedText: z.string().min(0).max(8000),
  improvedVersion: z.string().min(0).max(8000),
  errors: z.array(WritingErrorSchema).max(40),
  strengths: z.array(z.string().min(1).max(400)).max(15),
  suggestions: z.array(z.string().min(1).max(500)).max(15),
  weakAreas: z.array(z.string().min(1).max(80)).max(15),
  usefulPhrases: z.array(z.string().min(1).max(200)).max(20),
});

export type ParsedWritingFeedback = z.infer<typeof WritingFeedbackSchema>;

interface CheckOptions {
  task: Pick<
    WritingTaskDoc,
    "title" | "topic" | "cefr_level" | "type" | "instructions" | "requirements" | "min_words" | "ideal_answer" | "prompt" | "example"
  >;
  text: string;
  userLevel: CEFRLevel;
  /** Locale of explanations to AI (default: ru). */
  locale?: string;
}

const TOO_SHORT_LIMIT = 30;

export async function checkWritingWithAI(opts: CheckOptions): Promise<WritingFeedback> {
  const { task, text, userLevel } = opts;
  const trimmed = text.trim();
  const wordCount = countWords(trimmed);
  const tooShort = trimmed.length < TOO_SHORT_LIMIT || wordCount < Math.max(20, Math.floor((task.min_words ?? 60) / 2));

  if (tooShort) {
    return {
      score: 15,
      estimatedLevel: "A1",
      summary:
        "Текст слишком короткий, чтобы оценить навык письма. Раскройте задание подробнее: обращение, основная часть, просьба, прощание.",
      correctedText: trimmed,
      improvedVersion: "",
      errors: [],
      strengths: [],
      suggestions: [
        `Напишите минимум ${task.min_words ?? 60} слов.`,
        "Раскройте все требования задания.",
      ],
      weakAreas: ["Объём текста", "Структура письма"],
      usefulPhrases: [],
    };
  }

  const prompt = buildPrompt(task, trimmed, userLevel, opts.locale ?? "ru");

  const raw = await generateAIText({
    system:
      "Ты опытный преподаватель немецкого языка. Ты проверяешь письменные работы учеников уровня A1-B2 и даёшь обратную связь СТРОГО в JSON. Объяснения ошибок — на русском, простыми словами. Никогда не выходи за рамки JSON.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 3072,
    responseMimeType: "application/json",
  });

  let parsed: unknown;
  try {
    parsed = parseModelJson(raw);
  } catch {
    return fallback(trimmed, userLevel, "Не удалось разобрать ответ AI. Попробуйте ещё раз.");
  }

  const result = WritingFeedbackSchema.safeParse(parsed);
  if (!result.success) {
    return fallback(trimmed, userLevel, "Ответ AI не соответствует ожидаемому формату.");
  }

  return normalize(result.data, task);
}

function buildPrompt(
  task: CheckOptions["task"],
  text: string,
  userLevel: CEFRLevel,
  locale: string
): string {
  const explanationLang =
    locale === "en" ? "English" : locale === "de" ? "German" : locale === "uk" ? "Ukrainian" : "Russian";
  const instructions = task.instructions ?? task.prompt ?? "";
  const requirements = (task.requirements ?? []).map((r, i) => `${i + 1}. ${r}`).join("\n");
  const ideal = task.ideal_answer ?? task.example ?? "";

  return `Проверь письменное задание ученика. Уровень ученика: ${userLevel}.

ЗАДАНИЕ:
Title: ${task.title}
Topic: ${task.topic}
Type: ${task.type}
CEFR target: ${task.cefr_level}
Min words: ${task.min_words ?? 60}

Instructions:
${instructions}

Requirements:
${requirements || "—"}

ИДЕАЛЬНЫЙ ПРИМЕР (для ориентира; НЕ цитируй его дословно):
"""
${ideal}
"""

ТЕКСТ УЧЕНИКА:
"""
${text}
"""

Верни СТРОГО ОДИН JSON-объект (без markdown, без \`\`\`) такой структуры:
{
  "score": число 0-100,
  "estimatedLevel": "A1" | "A2" | "B1" | "B2",
  "summary": краткая обратная связь (1-3 предложения, ${explanationLang}),
  "correctedText": исправленная версия текста ученика, минимально изменённая — только ошибки,
  "improvedVersion": улучшенная версия (более естественные формулировки и структура),
  "errors": [
    {
      "type": "grammar" | "vocabulary" | "word_order" | "article" | "case" | "spelling" | "style",
      "original": ошибочный фрагмент из текста,
      "correct": правильный вариант,
      "explanationRu": объяснение ошибки на ${explanationLang}, простыми словами,
      "severity": "low" | "medium" | "high"
    }
  ],
  "strengths": массив сильных сторон (на ${explanationLang}),
  "suggestions": массив конкретных советов (на ${explanationLang}),
  "weakAreas": массив тегов слабых тем (Artikel, Akkusativ, Dativ, Word order, Perfekt, Formal style и т.д.),
  "usefulPhrases": массив полезных немецких фраз для этой темы
}

Правила:
- Никогда не переписывай весь текст без объяснений. correctedText должен быть минимальным редактированием.
- Все объяснения в "explanationRu" и других полях — на ${explanationLang}.
- Score: 100 = идеально, 80 = очень хорошо, 60 = соответствует уровню, 40 = много ошибок, 20 = текст не выполняет задание.
- Если текст слишком короткий или не соответствует заданию — score не выше 40.
- weakAreas должны быть короткими тегами, не предложениями.`;
}

function normalize(input: ParsedWritingFeedback, task: CheckOptions["task"]): WritingFeedback {
  const errors: WritingError[] = input.errors.map((err) => ({
    type: err.type,
    original: err.original,
    correct: err.correct,
    explanationRu: err.explanationRu,
    severity: err.severity,
  }));
  const wordCount = countWords(input.correctedText || "");
  const minWords = task.min_words ?? 60;
  let score = Math.round(input.score);
  if (wordCount > 0 && wordCount < minWords) {
    // text is below required length — cap the score
    score = Math.min(score, 55);
  }
  return {
    score,
    estimatedLevel: input.estimatedLevel,
    summary: input.summary,
    correctedText: input.correctedText,
    improvedVersion: input.improvedVersion,
    errors,
    strengths: input.strengths,
    suggestions: input.suggestions,
    weakAreas: dedupe(input.weakAreas).slice(0, 10),
    usefulPhrases: dedupe(input.usefulPhrases).slice(0, 10),
  };
}

function fallback(text: string, level: CEFRLevel, reason: string): WritingFeedback {
  return {
    score: 50,
    estimatedLevel: level,
    summary: reason,
    correctedText: text,
    improvedVersion: "",
    errors: [],
    strengths: [],
    suggestions: ["Попробуйте отправить текст ещё раз через минуту."],
    weakAreas: [],
    usefulPhrases: [],
  };
}

function parseModelJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object found");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).filter(Boolean).length;
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

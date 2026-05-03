import { NextRequest, NextResponse } from "next/server";
import { AIProviderError, generateAIText } from "@/lib/ai/server";

export async function POST(req: NextRequest) {
  try {
    const { text, templateTitle, cefrLevel } = await req.json();

    const prompt = `Проверь это немецкое письмо. Задание: "${templateTitle}". Целевой уровень: ${cefrLevel}.

Текст студента:
"""
${text}
"""

Верни ТОЛЬКО валидный JSON (без markdown, без \`\`\`json) в точно таком формате:
{
  "overall_score": <число 0-100>,
  "level_assessment": "<A1|A2|B1|B2>",
  "errors": [
    {
      "original": "<ошибочный фрагмент>",
      "correction": "<правильный вариант>",
      "explanation": "<объяснение на русском языке>",
      "rule": "<название правила по-немецки>",
      "severity": "<critical|important|minor>"
    }
  ],
  "style_tips": ["<совет на русском>"],
  "structure_feedback": "<комментарий о структуре на русском>",
  "positive_feedback": "<что сделано хорошо, на русском>",
  "suggested_phrases": ["<полезная немецкая фраза>"]
}

Найди все грамматические ошибки. Оценка: 100 = идеально, 70 = средний B1, 50 = много ошибок.`;

    const rawText = await generateAIText({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 2048,
    });

    let feedback;
    try {
      feedback = parseModelJson(rawText);
    } catch {
      feedback = { overall_score: 70, level_assessment: cefrLevel, errors: [], style_tips: ["Не удалось разобрать ответ AI"], structure_feedback: "", positive_feedback: "", suggested_phrases: [] };
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Writing check error:", error);
    if (error instanceof AIProviderError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    return NextResponse.json({ error: "Failed to check writing" }, { status: 500 });
  }
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

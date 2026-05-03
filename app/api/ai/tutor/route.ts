import { NextRequest, NextResponse } from "next/server";
import { AIProviderError, generateAIText, type AIChatMessage } from "@/lib/ai/server";

const SYSTEM_PROMPT = `Ты — персональный учитель немецкого языка для русскоязычного студента на уровне A2, который стремится к B1/B2.

Правила:
1. Объясняй грамматику и ошибки ВСЕГДА на русском языке
2. Немецкие примеры пиши на немецком
3. При исправлении ошибок и��пользуй формат:
   ❌ Ошибка: [неверный текст]
   ✅ Правильно: [корректный вариант]
   📝 Объяснение: [объяснение на русском]
4. Будь конкретным — давай примеры, не общие слова
5. Если создаёшь упражнения — давай минимум 3 примера
6. Уровень: A2 → B1/B2
7. Отвечай коротко и чётко — максимум 300-400 слов`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const messages: AIChatMessage[] = [
      ...sanitizeHistory(history),
      { role: "user", content: message.trim() },
    ];

    const response = await generateAIText({
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 1024,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Tutor error:", error);
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: error.publicMessage },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}

function sanitizeHistory(history: unknown): AIChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .filter((message): message is AIChatMessage => {
      if (typeof message !== "object" || message === null) return false;
      const item = message as Record<string, unknown>;
      return (
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
      );
    })
    .slice(-6)
    .map((message) => ({ role: message.role, content: message.content }));
}

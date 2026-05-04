import { NextRequest, NextResponse } from "next/server";
import { AIProviderError, generateAIText, type AIChatMessage } from "@/lib/ai/server";

interface SpeakingRequestBody {
  scenarioTitle: string;
  scenarioGoal: string;
  aiRoleDe: string;
  cefrLevel: string;
  history: AIChatMessage[];
  userMessage: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SpeakingRequestBody;

    if (!body.userMessage?.trim()) {
      return NextResponse.json({ error: "Сообщение пустое" }, { status: 400 });
    }

    const system = buildSystemPrompt(body);

    const messages: AIChatMessage[] = [
      ...sanitizeHistory(body.history),
      { role: "user", content: body.userMessage.trim() },
    ];

    const raw = await generateAIText({
      system,
      messages,
      maxTokens: 600,
    });

    const parsed = parseModelResponse(raw);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Speaking error:", error);
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: error.publicMessage },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Не удалось получить ответ AI" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(body: SpeakingRequestBody): string {
  return `Ты — собеседник в обучающем диалоге на немецком языке.

КОНТЕКСТ:
Сценарий: "${body.scenarioTitle}"
Цель студента: ${body.scenarioGoal}
Уровень студента: ${body.cefrLevel}
Твоя роль: ${body.aiRoleDe}

ПРАВИЛА:
1. Всегда отвечай ТОЛЬКО НА НЕМЕЦКОМ языке (естественно, как носитель), оставайся в роли.
2. Используй язык уровня ${body.cefrLevel} — короткие, понятные фразы.
3. Реагируй на то, что сказал студент, задавай уточняющие вопросы или продолжай сценарий.
4. Если студент сделал грубую ошибку — мягко переформулируй правильно (но не выходи из роли).
5. Если студент пишет на русском или просит помощи ("ich weiß nicht", "помоги"), коротко подскажи фразу на немецком.

ФОРМАТ ОТВЕТА — строго JSON, без markdown:
{
  "reply_de": "<твой ответ на немецком, оставаясь в роли>",
  "reply_ru": "<перевод твоего ответа на русский>",
  "feedback": {
    "has_errors": <true|false>,
    "corrected_de": "<если есть ошибки — как студенту следовало бы сказать; иначе пустая строка>",
    "note_ru": "<краткий совет на русском, если есть ошибки или подсказка; иначе пустая строка>"
  },
  "hint_de": "<опционально: подсказка-фраза на немецком, чтобы студент знал, как продолжить>"
}

Отвечай только JSON, ничего больше.`;
}

function sanitizeHistory(history: unknown): AIChatMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m): m is AIChatMessage => {
      if (typeof m !== "object" || m === null) return false;
      const r = m as Record<string, unknown>;
      return (
        (r.role === "user" || r.role === "assistant") &&
        typeof r.content === "string" &&
        r.content.trim().length > 0
      );
    })
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));
}

interface SpeakingResponse {
  reply_de: string;
  reply_ru: string;
  feedback: {
    has_errors: boolean;
    corrected_de: string;
    note_ru: string;
  };
  hint_de?: string;
}

function parseModelResponse(text: string): SpeakingResponse {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const tryParse = (raw: string): SpeakingResponse | null => {
    try {
      const obj = JSON.parse(raw) as Partial<SpeakingResponse> & {
        feedback?: Partial<SpeakingResponse["feedback"]>;
      };
      return {
        reply_de: typeof obj.reply_de === "string" ? obj.reply_de : "",
        reply_ru: typeof obj.reply_ru === "string" ? obj.reply_ru : "",
        feedback: {
          has_errors: !!obj.feedback?.has_errors,
          corrected_de:
            typeof obj.feedback?.corrected_de === "string"
              ? obj.feedback.corrected_de
              : "",
          note_ru:
            typeof obj.feedback?.note_ru === "string" ? obj.feedback.note_ru : "",
        },
        hint_de: typeof obj.hint_de === "string" ? obj.hint_de : undefined,
      };
    } catch {
      return null;
    }
  };

  const direct = tryParse(cleaned);
  if (direct && direct.reply_de) return direct;

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const fallback = tryParse(cleaned.slice(start, end + 1));
    if (fallback && fallback.reply_de) return fallback;
  }

  // Last resort — model didn't follow JSON; treat raw as German reply
  return {
    reply_de: cleaned || "Entschuldigung, ich habe Sie nicht verstanden. Können Sie das wiederholen?",
    reply_ru: "",
    feedback: { has_errors: false, corrected_de: "", note_ru: "" },
  };
}

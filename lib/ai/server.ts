import Anthropic from "@anthropic-ai/sdk";

export type AIProvider = "anthropic" | "openai" | "gemini";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GenerateAITextOptions {
  system?: string;
  messages: AIChatMessage[];
  maxTokens?: number;
}

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly publicMessage: string
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export function getAIProvider(): AIProvider {
  const requested = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (requested === "openai" || requested === "anthropic" || requested === "gemini") {
    return requested;
  }

  if (process.env.GEMINI_API_KEY) return "gemini";
  return process.env.OPENAI_API_KEY ? "openai" : "anthropic";
}

export async function generateAIText(options: GenerateAITextOptions): Promise<string> {
  const provider = getAIProvider();

  if (provider === "openai") {
    return generateOpenAIText(options);
  }

  if (provider === "gemini") {
    return generateGeminiText(options);
  }

  return generateAnthropicText(options);
}

async function generateAnthropicText({
  system,
  messages,
  maxTokens = 1024,
}: GenerateAITextOptions): Promise<string> {
  const client = new Anthropic({ apiKey: getRequiredEnv("ANTHROPIC_API_KEY") });

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

async function generateOpenAIText({
  system,
  messages,
  maxTokens = 1024,
}: GenerateAITextOptions): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRequiredEnv("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      instructions: system,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: maxTokens,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = extractErrorMessage(data);
    throw new AIProviderError(
      `OpenAI API error ${response.status}: ${message}`,
      response.status,
      getOpenAIPublicErrorMessage(response.status, message)
    );
  }

  const text = extractOpenAIOutputText(data);
  if (!text) {
    throw new Error("OpenAI API returned no text output");
  }

  return text;
}

async function generateGeminiText({
  system,
  messages,
  maxTokens = 1024,
}: GenerateAITextOptions): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": getRequiredEnv("GEMINI_API_KEY"),
      },
      body: JSON.stringify({
        system_instruction: system
          ? { parts: [{ text: system }] }
          : undefined,
        contents: toGeminiContents(messages),
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = extractErrorMessage(data);
    throw new AIProviderError(
      `Gemini API error ${response.status}: ${message}`,
      response.status,
      getGeminiPublicErrorMessage(response.status, message)
    );
  }

  const text = extractGeminiOutputText(data);
  if (!text) {
    throw new Error("Gemini API returned no text output");
  }

  return text;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function extractOpenAIOutputText(data: unknown): string {
  if (!isRecord(data)) return "";

  if (typeof data.output_text === "string") {
    return data.output_text.trim();
  }

  if (!Array.isArray(data.output)) return "";

  const chunks: string[] = [];
  for (const item of data.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;

    for (const content of item.content) {
      if (!isRecord(content)) continue;
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }

  return chunks.join("").trim();
}

function extractGeminiOutputText(data: unknown): string {
  if (!isRecord(data) || !Array.isArray(data.candidates)) return "";

  const chunks: string[] = [];
  for (const candidate of data.candidates) {
    if (!isRecord(candidate) || !isRecord(candidate.content)) continue;
    if (!Array.isArray(candidate.content.parts)) continue;

    for (const part of candidate.content.parts) {
      if (isRecord(part) && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("").trim();
}

function extractErrorMessage(data: unknown): string {
  if (!isRecord(data) || !isRecord(data.error)) return "Unknown error";
  return typeof data.error.message === "string" ? data.error.message : "Unknown error";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toGeminiContents(messages: AIChatMessage[]) {
  let hasUserMessage = false;

  return messages.flatMap((message) => {
    if (message.role === "user") {
      hasUserMessage = true;
      return [{ role: "user", parts: [{ text: message.content }] }];
    }

    if (!hasUserMessage) return [];
    return [{ role: "model", parts: [{ text: message.content }] }];
  });
}

function getOpenAIPublicErrorMessage(status: number, message: string): string {
  const normalized = message.toLowerCase();

  if (status === 401) {
    return "OpenAI API ключ не принят. Проверьте OPENAI_API_KEY в .env.local.";
  }

  if (status === 429 && normalized.includes("quota")) {
    return "У OpenAI проекта нет доступной квоты. Проверьте Billing/Usage в OpenAI Dashboard.";
  }

  if (status === 429) {
    return "OpenAI временно ограничил запросы. Попробуйте позже или проверьте лимиты проекта.";
  }

  return "OpenAI вернул ошибку. Проверьте настройки модели и ключа.";
}

function getGeminiPublicErrorMessage(status: number, message: string): string {
  const normalized = message.toLowerCase();

  if (status === 400 && normalized.includes("api key")) {
    return "Gemini API ключ не принят. Проверьте GEMINI_API_KEY в .env.local.";
  }

  if (status === 401 || status === 403) {
    return "Gemini API отказал в доступе. Проверьте ключ, проект и доступность Gemini API.";
  }

  if (status === 404) {
    return "Gemini модель не найдена. Проверьте GEMINI_MODEL в .env.local.";
  }

  if (status === 429) {
    return "Gemini временно ограничил запросы. Проверьте бесплатные лимиты или попробуйте позже.";
  }

  return "Gemini вернул ошибку. Проверьте настройки модели и ключа.";
}

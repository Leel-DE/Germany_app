import Anthropic from "@anthropic-ai/sdk";

export type AIProvider = "anthropic" | "openai" | "gemini" | "xai";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GenerateAITextOptions {
  system?: string;
  messages: AIChatMessage[];
  maxTokens?: number;
  responseMimeType?: "application/json";
  responseJsonSchema?: Record<string, unknown>;
}

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_XAI_MODEL = "grok-4";

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

  if (requested === "openai" || requested === "anthropic" || requested === "gemini" || requested === "xai") {
    return requested;
  }

  if (process.env.XAI_API_KEY) return "xai";
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

  if (provider === "xai") {
    return generateXAIText(options);
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

async function generateXAIText({
  system,
  messages,
  maxTokens = 1024,
}: GenerateAITextOptions): Promise<string> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRequiredEnv("XAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL ?? DEFAULT_XAI_MODEL,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = extractErrorMessage(data);
    throw new AIProviderError(
      `xAI API error ${response.status}: ${message}`,
      response.status,
      getXAIPublicErrorMessage(response.status, message)
    );
  }

  const text = extractChatCompletionText(data);
  if (!text) {
    throw new Error("xAI API returned no text output");
  }

  return text;
}

async function generateGeminiText({
  system,
  messages,
  maxTokens = 1024,
  responseMimeType,
  responseJsonSchema,
}: GenerateAITextOptions): Promise<string> {
  const models = uniqueValues([
    process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
    process.env.GEMINI_FALLBACK_MODEL,
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
  ]);
  let lastError: unknown;

  for (const model of models) {
    try {
      return await callGeminiModel({ model, system, messages, maxTokens, responseMimeType, responseJsonSchema });
    } catch (error) {
      lastError = error;
      if (!isTransientAIError(error)) throw error;
      await sleep(700);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini API request failed");
}

async function callGeminiModel({
  model,
  system,
  messages,
  maxTokens = 1024,
  responseMimeType,
  responseJsonSchema,
}: GenerateAITextOptions & { model: string }): Promise<string> {
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
          ...(responseMimeType ? { responseMimeType } : {}),
          ...(responseJsonSchema ? { responseJsonSchema } : {}),
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

function isTransientAIError(error: unknown): boolean {
  return error instanceof AIProviderError && [500, 502, 503, 504].includes(error.status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uniqueValues(values: (string | undefined)[]): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
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

function extractChatCompletionText(data: unknown): string {
  if (!isRecord(data) || !Array.isArray(data.choices)) return "";

  const chunks: string[] = [];
  for (const choice of data.choices) {
    if (!isRecord(choice) || !isRecord(choice.message)) continue;
    if (typeof choice.message.content === "string") chunks.push(choice.message.content);
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
    if (normalized.includes("quota")) {
      return "У Gemini закончилась доступная квота/free-tier лимит для этого API ключа. Подождите сброс лимита или подключите billing/другой ключ.";
    }

    return "Gemini временно ограничил запросы. Проверьте бесплатные лимиты или попробуйте позже.";
  }

  if ([500, 502, 503, 504].includes(status)) {
    return "Gemini сейчас перегружен или временно недоступен. Ключ работает; это не похоже на закончившиеся токены. Попробуйте ещё раз через минуту.";
  }

  return "Gemini вернул ошибку. Проверьте настройки модели и ключа.";
}

function getXAIPublicErrorMessage(status: number, message: string): string {
  const normalized = message.toLowerCase();

  if (status === 401) {
    return "xAI API ключ не принят. Проверьте XAI_API_KEY в .env.local.";
  }

  if (status === 403) {
    return "xAI отклонил запрос. В xAI Console добавьте оплаченные кредиты/billing или проверьте доступ ключа к API.";
  }

  if (status === 404 || normalized.includes("model")) {
    return "xAI модель не найдена. Проверьте XAI_MODEL в .env.local.";
  }

  if (status === 429) {
    return "xAI временно ограничил запросы. Проверьте лимиты/баланс проекта или попробуйте позже.";
  }

  if ([500, 502, 503, 504].includes(status)) {
    return "xAI сейчас перегружен или временно недоступен. Попробуйте еще раз через минуту.";
  }

  return "xAI вернул ошибку. Проверьте настройки модели и ключа.";
}

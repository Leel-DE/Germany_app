"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Volume2, Send, Mic, MicOff, Loader2,
  Eye, EyeOff, Lightbulb, AlertCircle, CheckCircle2, RotateCcw, X, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SPEAKING_SCENARIOS } from "@/lib/data/speakingScenarios";

interface Message {
  role: "user" | "assistant";
  content_de: string;
  content_ru?: string;
  feedback?: {
    has_errors: boolean;
    corrected_de: string;
    note_ru: string;
  };
  hint_de?: string;
}

const speak = (text: string) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "de-DE";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
};

function getRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function SpeakingDialoguePage() {
  const router = useRouter();
  const params = useParams();
  const scenarioId = params.id as string;
  const scenario = useMemo(
    () => SPEAKING_SCENARIOS.find((s) => s.id === scenarioId),
    [scenarioId]
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState<Record<number, boolean>>({});
  const [showInfo, setShowInfo] = useState(true);
  const [showPhrases, setShowPhrases] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [completedGoals, setCompletedGoals] = useState<Set<number>>(new Set());

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initial AI greeting
  useEffect(() => {
    if (!scenario) return;
    setMessages([
      {
        role: "assistant",
        content_de: scenario.opening_message_de,
        content_ru: scenario.opening_message_ru,
      },
    ]);
    // Speak the opening
    setTimeout(() => speak(scenario.opening_message_de), 600);
  }, [scenario]);

  // Speech recognition setup
  useEffect(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;
    setSttSupported(true);
    const rec = new Recognition();
    rec.lang = "de-DE";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setInput((prev) => (prev ? prev + " " : "") + transcript);
      }
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        "no-speech": "Не услышал речь. Попробуй ещё раз.",
        "audio-capture": "Нет доступа к микрофону.",
        "not-allowed": "Микрофон заблокирован. Разреши доступ в настройках браузера.",
        network: "Проблемы с сетью при распознавании.",
      };
      setSttError(errorMessages[e.error] ?? `Ошибка распознавания: ${e.error}`);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    return () => {
      rec.abort();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!scenario) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Сценарий не найден</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/speaking")}>← Назад</Button>
      </div>
    );
  }

  const toggleTranslation = (i: number) =>
    setShowTranslation((prev) => ({ ...prev, [i]: !prev[i] }));

  const handleMicToggle = () => {
    setSttError(null);
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      try {
        rec.start();
        setIsListening(true);
      } catch {
        setSttError("Не удалось запустить распознавание.");
      }
    }
  };

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content_de: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: scenario.title,
          scenarioGoal: scenario.goal,
          aiRoleDe: scenario.ai_role.de,
          cefrLevel: scenario.cefr_level,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content_de,
          })),
          userMessage: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content_de: data.error ?? "Произошла ошибка. Проверь настройку AI в .env.local.",
            content_ru: "",
          },
        ]);
        return;
      }

      // Update last user message with feedback
      setMessages((prev) => {
        const next = [...prev];
        const lastUserIdx = next
          .map((m, i) => (m.role === "user" ? i : -1))
          .filter((i) => i !== -1)
          .pop();
        if (lastUserIdx !== undefined && data.feedback) {
          next[lastUserIdx] = { ...next[lastUserIdx], feedback: data.feedback };
        }
        next.push({
          role: "assistant",
          content_de: data.reply_de,
          content_ru: data.reply_ru,
          hint_de: data.hint_de,
        });
        return next;
      });

      if (data.reply_de) speak(data.reply_de);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content_de: "Не удалось подключиться к AI. Проверь AI_PROVIDER и API ключ в .env.local",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const restart = () => {
    setMessages([
      {
        role: "assistant",
        content_de: scenario.opening_message_de,
        content_ru: scenario.opening_message_ru,
      },
    ]);
    setShowTranslation({});
    setCompletedGoals(new Set());
    setTimeout(() => speak(scenario.opening_message_de), 300);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)] animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/speaking")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-2xl">{scenario.emoji}</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold leading-tight truncate">{scenario.title}</h1>
          <p className="text-xs text-muted-foreground truncate">{scenario.title_ru}</p>
        </div>
        <Badge variant={scenario.cefr_level.toLowerCase() as "a2" | "b1" | "b2"}>
          {scenario.cefr_level}
        </Badge>
        <Button variant="ghost" size="icon-sm" onClick={restart} title="Начать заново">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Info card (collapsible) */}
      {showInfo && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-3 shrink-0 relative">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-primary mb-0.5">Сценарий:</p>
              <p className="text-muted-foreground">{scenario.description}</p>
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <p className="text-[11px] font-semibold text-muted-foreground">Цели диалога:</p>
            <ul className="space-y-0.5">
              {scenario.goals_checklist.map((goal, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <button
                    onClick={() =>
                      setCompletedGoals((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className="shrink-0 mt-0.5"
                  >
                    {completedGoals.has(i) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/40" />
                    )}
                  </button>
                  <span className={completedGoals.has(i) ? "line-through text-muted-foreground" : ""}>
                    {goal}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 animate-fade-slide-up",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 text-sm",
                msg.role === "user" ? "bg-primary/10" : "bg-muted"
              )}
            >
              {msg.role === "user" ? "🧑" : scenario.emoji}
            </div>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm"
              )}
            >
              <div className="flex items-start gap-2">
                <p className={cn("flex-1", msg.role === "assistant" && "de-text")}>
                  {msg.content_de}
                </p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speak(msg.content_de)}
                    className="text-muted-foreground hover:text-primary shrink-0 mt-0.5"
                    title="Произношение"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* AI translation toggle */}
              {msg.role === "assistant" && msg.content_ru && (
                <button
                  onClick={() => toggleTranslation(i)}
                  className="mt-1.5 text-[11px] flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  {showTranslation[i] ? (
                    <><EyeOff className="w-3 h-3" /> Скрыть перевод</>
                  ) : (
                    <><Eye className="w-3 h-3" /> Показать перевод</>
                  )}
                </button>
              )}
              {msg.role === "assistant" && msg.content_ru && showTranslation[i] && (
                <p className="mt-1 pt-1.5 border-t border-border/50 text-xs text-muted-foreground">
                  {msg.content_ru}
                </p>
              )}

              {/* Hint */}
              {msg.role === "assistant" && msg.hint_de && (
                <div className="mt-2 pt-2 border-t border-border/50 flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[11px] text-muted-foreground">Подсказка:</p>
                    <button
                      onClick={() => setInput(msg.hint_de!)}
                      className="text-xs de-text hover:underline text-left"
                    >
                      {msg.hint_de}
                    </button>
                  </div>
                </div>
              )}

              {/* User feedback */}
              {msg.role === "user" && msg.feedback?.has_errors && (
                <div className="mt-2 pt-2 border-t border-primary-foreground/30 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <div className="flex-1 text-[11px] opacity-95">
                      {msg.feedback.corrected_de && (
                        <p className="italic">→ {msg.feedback.corrected_de}</p>
                      )}
                      {msg.feedback.note_ru && (
                        <p className="opacity-90 mt-0.5">{msg.feedback.note_ru}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {msg.role === "user" && msg.feedback && !msg.feedback.has_errors && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] opacity-90">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Хорошо!</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
              {scenario.emoji}
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Печатает...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Useful phrases drawer */}
      {showPhrases && (
        <div className="rounded-xl border border-border bg-card p-3 mb-2 max-h-44 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">💡 Полезные фразы для этого сценария</p>
            <button onClick={() => setShowPhrases(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {scenario.useful_phrases.map((p) => (
              <div key={p.de} className="flex items-start gap-2 text-xs">
                <button
                  onClick={() => speak(p.de)}
                  className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary/20"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setInput(p.de)}
                  className="flex-1 text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
                >
                  <p className="de-text">{p.de}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{p.ru}</p>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 space-y-2">
        {sttError && (
          <div className="rounded-lg bg-again/10 text-again text-xs px-3 py-1.5 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">{sttError}</span>
            <button onClick={() => setSttError(null)}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* Phrases toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
            onClick={() => setShowPhrases((prev) => !prev)}
            title="Полезные фразы"
          >
            <Lightbulb className="w-4 h-4" />
          </Button>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Слушаю..."
                : "Напиши на немецком (Enter — отправить)"
            }
            className={cn(
              "min-h-[52px] max-h-[120px] resize-none text-sm de-text",
              isListening && "border-primary ring-2 ring-primary/30"
            )}
            rows={1}
          />

          {sttSupported && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className="h-[52px] w-[52px] shrink-0"
              onClick={handleMicToggle}
              title={isListening ? "Остановить" : "Голосовой ввод (нем.)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}

          <Button
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
            disabled={!input.trim() || isLoading}
            onClick={() => sendMessage(input)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {!sttSupported && (
          <p className="text-[10px] text-muted-foreground text-center">
            Голосовой ввод доступен в Chrome, Edge и Safari
          </p>
        )}
      </div>
    </div>
  );
}

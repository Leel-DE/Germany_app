"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const QUICK_PROMPTS = [
  "Объясни разницу между weil и denn",
  "Когда использовать Perfekt, а когда Präteritum?",
  "Создай упражнения на Akkusativ",
  "Как правильно: 'Ich fahre mit dem Bus' или 'mit den Bus'?",
  "Проверь моё предложение: Ich habe gestern ins Kino gegangen.",
  "Объясни Konjunktiv II на примерах",
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hallo! 👋 Я твой персональный AI-тьютор немецкого языка.\n\nМогу:\n• Объяснить грамматику на русском\n• Проверить твои предложения\n• Создать упражнения\n• Ответить на любой вопрос о немецком\n\nС чего начнём?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.ok
          ? data.response
          : data.error ?? "Извините, произошла ошибка. Проверьте настройку API ключа.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Не удалось подключиться к AI. Проверьте AI_PROVIDER и API ключ в .env.local",
        timestamp: new Date().toISOString(),
      }]);
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)] animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">AI-тьютор</h1>
          <p className="text-xs text-muted-foreground">Объясняю немецкий на русском языке</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2.5 animate-fade-slide-up",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === "user" ? "bg-primary/10" : "bg-secondary/10"
            )}>
              {msg.role === "user"
                ? <User className="w-3.5 h-3.5 text-primary" />
                : <Bot className="w-3.5 h-3.5 text-secondary" />
              }
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card border border-border rounded-tl-sm"
            )}>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Думаю...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="shrink-0 pb-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Быстрые вопросы
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Задай вопрос по немецкому... (Enter — отправить)"
          className="min-h-[52px] max-h-[120px] resize-none text-sm"
          rows={1}
        />
        <Button
          size="icon"
          className="h-[52px] w-[52px] shrink-0"
          disabled={!input.trim() || isLoading}
          onClick={() => sendMessage(input)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

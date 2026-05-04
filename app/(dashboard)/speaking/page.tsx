"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Volume2, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SPEAKING_SCENARIOS, DAILY_PHRASES } from "@/lib/data/speakingScenarios";

const speak = (text: string) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "de-DE";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
};

type Tab = "scenarios" | "phrases";

export default function SpeakingPage() {
  const [tab, setTab] = useState<Tab>("scenarios");

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Разговор</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Диалоги с AI-партнёром на немецком + полезные фразы
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted">
        {([
          { value: "scenarios" as const, label: "Сценарии", icon: MessageCircle },
          { value: "phrases" as const, label: "Фразы", icon: Sparkles },
        ]).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
              tab === value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "scenarios" ? (
        <>
          <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
            <p className="text-sm font-semibold text-secondary mb-1">🎭 Ролевые диалоги</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI играет немца в реальной ситуации. Пиши или говори на немецком — AI ответит, поправит ошибки и поможет фразами.
            </p>
          </div>

          <div className="space-y-2">
            {SPEAKING_SCENARIOS.map((scenario) => (
              <Link key={scenario.id} href={`/speaking/${scenario.id}`}>
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-sm transition-all active:scale-[0.99]">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                    {scenario.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight">{scenario.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{scenario.title_ru}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant={scenario.cefr_level.toLowerCase() as "a2" | "b1" | "b2"}>
                        {scenario.cefr_level}
                      </Badge>
                      <Badge variant="muted">{scenario.topic}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary mb-1">💬 Готовые фразы</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Самые нужные фразы для жизни в Германии. Нажми на 🔊, чтобы услышать произношение.
            </p>
          </div>

          {Object.entries(DAILY_PHRASES).map(([category, phrases]) => (
            <div key={category} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <p className="text-sm font-semibold">{category}</p>
              </div>
              <ul className="divide-y divide-border">
                {phrases.map((phrase) => (
                  <li key={phrase.de} className="p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                    <button
                      onClick={() => speak(phrase.de)}
                      className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 shrink-0 mt-0.5 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="de-text text-sm">{phrase.de}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{phrase.ru}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

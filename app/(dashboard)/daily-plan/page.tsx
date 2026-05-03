"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanStep } from "@/types";

const PLAN_STEPS: PlanStep[] = [
  { type: "srs_review", label: "Повторение слов", estimatedMinutes: 4, count: 12 },
  { type: "new_words", label: "5 новых слов — тема «Wohnung»", estimatedMinutes: 8, count: 5 },
  { type: "grammar", label: "Грамматика: Der Akkusativ", estimatedMinutes: 10, topicSlug: "akkusativ" },
  { type: "reading", label: "Чтение: 'Im Supermarkt'", estimatedMinutes: 5 },
  { type: "mini_test", label: "Мини-тест на сегодняшний материал", estimatedMinutes: 3 },
];

const STEP_ICONS: Record<string, string> = {
  srs_review: "🃏", new_words: "📚", grammar: "📖", reading: "📄", writing: "✏️", mini_test: "✅", listening: "🎧",
};

const STEP_LINKS: Record<string, string> = {
  srs_review: "/srs", new_words: "/vocabulary", grammar: "/grammar/akkusativ", reading: "/reading", writing: "/writing", mini_test: "/tests",
};

type SessionState = "overview" | "active" | "complete";

export default function DailyPlanPage() {
  const [sessionState, setSessionState] = useState<SessionState>("overview");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalMinutes = PLAN_STEPS.reduce((s, p) => s + p.estimatedMinutes, 0);

  // ── OVERVIEW ─────────────────────────────────────────────────────────────────
  if (sessionState === "overview") {
    return (
      <div className="space-y-5 animate-fade-slide-up">
        <div>
          <h1 className="text-xl font-bold">Занятие дня</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">Сегодняшний план готов</p>
              <p className="text-sm text-muted-foreground">5 шагов · {totalMinutes} минут</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Слов повторить", value: "12" },
              { label: "Новых слов", value: "5" },
              { label: "Грамматика", value: "1 тема" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-card p-3 text-center border border-border">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <Button className="w-full h-12 text-base gap-2" onClick={() => setSessionState("active")}>
            ▶ Начать занятие
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Steps preview */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground px-1">План занятия</p>
          {PLAN_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
              <span className="text-2xl">{STEP_ICONS[step.type]}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{step.label}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{step.estimatedMinutes} мин</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">Шаг {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── ACTIVE SESSION ────────────────────────────────────────────────────────────
  if (sessionState === "active") {
    const step = PLAN_STEPS[currentStep];
    const progress = Math.round((completedSteps.length / PLAN_STEPS.length) * 100);

    const handleComplete = () => {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      if (currentStep === PLAN_STEPS.length - 1) {
        setSessionState("complete");
      } else {
        setCurrentStep(prev => prev + 1);
      }
    };

    return (
      <div className="space-y-5 animate-fade-slide-up">
        {/* Progress header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setSessionState("overview")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Шаг {currentStep + 1} из {PLAN_STEPS.length}</span>
              <span>{progress}% выполнено</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Step card */}
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 text-center space-y-4">
          <div className="text-5xl">{STEP_ICONS[step.type]}</div>
          <div>
            <p className="text-xl font-bold">{step.label}</p>
            <p className="text-sm text-muted-foreground mt-1">≈ {step.estimatedMinutes} минут</p>
          </div>
          <Link href={STEP_LINKS[step.type] ?? "/"}>
            <Button className="w-full h-12 text-base gap-2">
              Перейти к упражнению
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" className="w-full gap-2" onClick={handleComplete}>
            <CheckCircle2 className="w-4 h-4" />
            Отметить как выполненное
          </Button>
        </div>

        {/* Steps list */}
        <div className="space-y-1.5">
          {PLAN_STEPS.map((s, i) => {
            const done = completedSteps.includes(i);
            const active = i === currentStep;
            return (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                  active ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/50"
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0",
                    active ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )} />
                )}
                <span className="text-base">{STEP_ICONS[s.type]}</span>
                <span className={cn("text-sm flex-1", done && "line-through text-muted-foreground", active && "font-medium")}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8 animate-fade-slide-up">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-2xl font-bold">Занятие завершено!</h2>
        <p className="text-muted-foreground mt-1">Отличная работа — серия продолжается!</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { emoji: "🃏", label: "Повторено слов", value: "12" },
          { emoji: "📚", label: "Новых слов", value: "5" },
          { emoji: "🏆", label: "Точность", value: "84%" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl">{s.emoji}</p>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2.5 rounded-full font-semibold">
        🔥 Серия: 8 дней подряд!
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="outline" className="flex-1" onClick={() => { setSessionState("overview"); setCompletedSteps([]); setCurrentStep(0); }}>
          Повторить
        </Button>
        <Link href="/home" className="flex-1">
          <Button className="w-full">На главную</Button>
        </Link>
      </div>
    </div>
  );
}

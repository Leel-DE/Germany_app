import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanStep } from "@/types";

const stepIcons: Record<string, string> = {
  srs_review: "🃏",
  new_words: "📚",
  grammar: "📖",
  reading: "📄",
  writing: "✏️",
  mini_test: "✅",
  listening: "🎧",
};

interface TodayPlanProps {
  steps: PlanStep[];
  completedSteps: number;
  estimatedMinutes: number;
}

export function TodayPlan({ steps, completedSteps, estimatedMinutes }: TodayPlanProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-base">Сегодняшнее занятие</p>
          <p className="text-xs text-muted-foreground mt-0.5">≈ {estimatedMinutes} мин · {completedSteps}/{steps.length} шагов</p>
        </div>
        <Link href="/daily-plan">
          <Button size="sm">
            {completedSteps === 0 ? "Начать" : completedSteps === steps.length ? "Готово ✓" : "Продолжить"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${steps.length > 0 ? (completedSteps / steps.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ul className="px-5 pb-4 space-y-2">
        {steps.map((step, i) => {
          const done = i < completedSteps;
          const active = i === completedSteps;
          return (
            <li key={i} className={`flex items-center gap-3 text-sm ${done ? "text-muted-foreground" : ""}`}>
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Circle className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground/40"}`} />
              )}
              <span className="text-base">{stepIcons[step.type] ?? "•"}</span>
              <span className={active ? "font-medium text-foreground" : ""}>{step.label}</span>
              <span className="ml-auto text-xs text-muted-foreground/60 shrink-0">{step.estimatedMinutes}м</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

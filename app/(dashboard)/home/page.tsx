import Link from "next/link";
import { BookOpen, Flame, Target, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodayPlan } from "@/components/dashboard/TodayPlan";
import { WeakTopics } from "@/components/dashboard/WeakTopics";
import type { PlanStep } from "@/types";

// Demo data — will come from Supabase
const demoSteps: PlanStep[] = [
  { type: "srs_review", label: "Повторить 12 слов", estimatedMinutes: 4, count: 12 },
  { type: "new_words", label: "5 новых слов (Wohnung)", estimatedMinutes: 8, count: 5 },
  { type: "grammar", label: "Грамматика: Der Akkusativ", estimatedMinutes: 10, topicSlug: "akkusativ" },
  { type: "reading", label: "Чтение: текст A2", estimatedMinutes: 5 },
  { type: "mini_test", label: "Мини-тест: проверь себя", estimatedMinutes: 3 },
];

const demoWeakTopics = [
  { slug: "akkusativ", title: "Der Akkusativ", score: 58 },
  { slug: "perfekt", title: "Das Perfekt", score: 63 },
];

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long"
  });

  return (
    <div className="space-y-5 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Привет! 👋</h1>
          <p className="text-muted-foreground text-sm mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-sm font-semibold">
          <Flame className="w-4 h-4 streak-fire" />
          <span>7 дней</span>
        </div>
      </div>

      {/* Level progress + quick stats */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-5">
        <div className="flex items-center gap-6">
          <ProgressRing
            value={56}
            size={88}
            strokeWidth={8}
            sublabel="A2→B1"
            color="var(--primary)"
          />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Словарный запас</span>
                <span className="text-sm font-bold">847 / 1500</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "56%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Грамматика</span>
                <span className="text-sm font-bold">8 / 21</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: "38%" }} />
              </div>
            </div>
          </div>
        </div>

        <Link href="/daily-plan" className="mt-4 block">
          <Button className="w-full h-12 text-base gap-2" size="lg">
            ▶ Начать занятие
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="слов выучено"
          value={847}
          icon={BookOpen}
          color="blue"
          sublabel="из 1500 для B1"
        />
        <StatCard
          label="дней подряд"
          value={7}
          icon={Flame}
          color="orange"
          sublabel="рекорд: 14"
        />
        <StatCard
          label="точность ответов"
          value="84%"
          icon={Target}
          color="green"
          sublabel="за последние 7 дней"
        />
        <StatCard
          label="пройдено тем"
          value="8/21"
          icon={Trophy}
          color="purple"
          sublabel="грамматика"
        />
      </div>

      {/* Today's plan */}
      <TodayPlan
        steps={demoSteps}
        completedSteps={1}
        estimatedMinutes={30}
      />

      {/* Weak topics */}
      <WeakTopics topics={demoWeakTopics} />

      {/* Quick access */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">Быстрый доступ</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/srs", emoji: "🃏", label: "Карточки SRS", sub: "12 к повторению" },
            { href: "/vocabulary", emoji: "📚", label: "Словарь", sub: "847 слов" },
            { href: "/ai-tutor", emoji: "🤖", label: "AI-тьютор", sub: "Задать вопрос" },
            { href: "/writing", emoji: "✍️", label: "Письмо", sub: "10 шаблонов" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card hover:bg-muted transition-colors"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  GraduationCap,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CEFRLevel, PlanStepType, PlanStatus } from "@/types";
import { useLocale, useTranslations } from "next-intl";

interface DashboardResponse {
  user: {
    id: string;
    name: string;
    current_level: CEFRLevel;
    target_level: CEFRLevel;
    minutes_per_day: number;
    streak_days: number;
    profession: string | null;
  };
  progress: SkillProgress[];
  today_plan: {
    id: string;
    date: string;
    status: PlanStatus;
    estimated_minutes: number;
    completed: number;
    total: number;
    progress_percent: number;
    steps: TodayPlanStep[];
  };
  stats: {
    words_learned: number;
    due_reviews: number;
    grammar_completed: number;
    reading_completed: number;
    writing_submissions: number;
    accuracy_percent: number;
    level_progress_percent: number;
  };
  weak_areas: WeakArea[];
  recommendation: {
    title: string;
    text: string;
    cta: string;
    target: {
      type: "focused_practice";
      topic: string;
      practiceType: "grammar" | "vocabulary" | "reading" | "mixed";
    };
  };
  last_activity: ActivityItem[];
}

interface SkillProgress {
  label: string;
  current: number;
  target: number;
  unit: string;
  progress_percent: number;
  href: string;
  empty: boolean;
}

interface TodayPlanStep {
  type: PlanStepType;
  title: string;
  estimate_minutes: number;
  status: "done" | "pending";
  href: string;
}

interface WeakArea {
  type: "grammar" | "vocabulary";
  slug: string;
  title: string;
  confidence: number;
  source: string;
  href: string;
}

interface ActivityItem {
  type: string;
  title: string;
  occurred_at: string;
  href: string;
}

export function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingPractice, setStartingPractice] = useState<string | null>(null);
  const tDashboard = useTranslations("dashboard");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const loadDashboardError = tErrors("couldNotLoadDashboard");

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? loadDashboardError);
        }
        const dashboard = (await res.json()) as DashboardResponse;
        if (alive) setData(dashboard);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : loadDashboardError);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      alive = false;
    };
  }, [loadDashboardError]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error} />;
  if (!data) return <EmptyDashboard />;

  async function startFocusedPractice(topic: string, type: "grammar" | "vocabulary" | "reading" | "mixed") {
    setStartingPractice(topic);
    setError(null);
    try {
      const res = await fetch("/api/focused-practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? tErrors("couldNotStartPractice"));
      router.push(body.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors("couldNotStartPractice"));
      setStartingPractice(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-6 md:gap-5">
      <UserSummary data={data} tDashboard={tDashboard} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <TodayPlan plan={data.today_plan} tDashboard={tDashboard} />
        <Recommendation
          recommendation={data.recommendation}
          loading={startingPractice === data.recommendation.target.topic}
          onStart={() => startFocusedPractice(data.recommendation.target.topic, data.recommendation.target.practiceType)}
          tDashboard={tDashboard}
        />
      </section>

      <OverallProgress items={data.progress} tDashboard={tDashboard} />
      <QuickStats stats={data.stats} tDashboard={tDashboard} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <WeakAreas
          areas={data.weak_areas}
          loadingTopic={startingPractice}
          onPractice={(area) => startFocusedPractice(area.slug, area.type)}
          tDashboard={tDashboard}
        />
        <LastActivity items={data.last_activity} tDashboard={tDashboard} locale={locale} />
      </section>
    </main>
  );
}

function UserSummary({ data, tDashboard }: { data: DashboardResponse; tDashboard: ReturnType<typeof useTranslations<"dashboard">> }) {
  const chips = [
    { label: tDashboard("current"), value: data.user.current_level },
    { label: tDashboard("target"), value: data.user.target_level },
    { label: tDashboard("plan"), value: `${data.user.minutes_per_day} min/day` },
    { label: tDashboard("streak"), value: `${data.user.streak_days} days` },
  ];

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold leading-tight">{tDashboard("welcome", { name: data.user.name })}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.user.profession ? `${data.user.profession} - ` : ""}{tDashboard("learningDashboard")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {chips.map((chip) => (
            <div key={chip.label} className="rounded-lg border border-border bg-background px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{chip.label}</p>
              <p className="mt-0.5 text-sm font-semibold">{chip.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OverallProgress({ items, tDashboard }: { items: SkillProgress[]; tDashboard: ReturnType<typeof useTranslations<"dashboard">> }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <SectionHeader icon={BarChart3} title={tDashboard("overallProgress")} subtitle={tDashboard("overallProgressSubtitle")} />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-lg border border-border bg-background p-3 transition hover:bg-muted/60">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium">{item.label}</p>
              <p className="text-sm font-semibold">
                {item.current} / {item.target}
              </p>
            </div>
            <Progress value={item.progress_percent} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {item.empty ? tDashboard("emptyTracked", { unit: item.unit }) : tDashboard("unitGoal", { percent: item.progress_percent, unit: item.unit })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TodayPlan({ plan, tDashboard }: { plan: DashboardResponse["today_plan"]; tDashboard: ReturnType<typeof useTranslations<"dashboard">> }) {
  const doneText = tDashboard("completedCount", { completed: plan.completed, total: plan.total });

  return (
    <section className="rounded-lg border border-primary/25 bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader icon={Target} title={tDashboard("todayPlanTitle")} subtitle={`${doneText} - ${tDashboard("minutesShort", { minutes: plan.estimated_minutes })}`} />
        <Button asChild className="h-11 shrink-0">
          <Link href="/daily-plan">
            {tDashboard("startTodayPlan")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-4">
        <Progress value={plan.progress_percent} className="h-2.5" />
      </div>
      {plan.steps.length ? (
        <ul className="mt-4 space-y-2">
          {plan.steps.slice(0, 7).map((step, index) => (
            <li key={`${step.type}-${index}`}>
              <Link href={step.href} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:bg-muted/60">
                {step.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{formatStepType(step.type)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  {step.estimate_minutes}m
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={tDashboard("noTasksToday")} text={tDashboard("noTasksTodayDesc")} href="/daily-plan" />
      )}
    </section>
  );
}

function QuickStats({ stats, tDashboard }: { stats: DashboardResponse["stats"]; tDashboard: ReturnType<typeof useTranslations<"dashboard">> }) {
  const cards = [
    { label: tDashboard("quickStatsWords"), value: stats.words_learned, icon: BookOpen },
    { label: tDashboard("quickStatsReviews"), value: stats.due_reviews, icon: Flame },
    { label: tDashboard("quickStatsGrammar"), value: stats.grammar_completed, icon: GraduationCap },
    { label: tDashboard("quickStatsReading"), value: stats.reading_completed, icon: BookOpen },
    { label: tDashboard("quickStatsWriting"), value: stats.writing_submissions, icon: PenLine },
    { label: tDashboard("quickStatsAccuracy"), value: `${stats.accuracy_percent}%`, icon: TrendingUp },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-border bg-card p-3">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </section>
  );
}

function WeakAreas({
  areas,
  loadingTopic,
  onPractice,
  tDashboard,
}: {
  areas: WeakArea[];
  loadingTopic: string | null;
  onPractice: (area: WeakArea) => void;
  tDashboard: ReturnType<typeof useTranslations<"dashboard">>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <SectionHeader icon={AlertCircle} title={tDashboard("weakAreas")} subtitle={tDashboard("weakAreasSubtitle")} />
      {areas.length ? (
        <div className="mt-4 space-y-3">
          {areas.map((area) => (
            <div key={`${area.type}-${area.slug}`} className="rounded-lg border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{area.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">{area.type} - {area.source}</p>
                </div>
                <span className="text-sm font-semibold">{area.confidence}%</span>
              </div>
              <Progress value={area.confidence} className="h-2" />
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                disabled={loadingTopic === area.slug}
                onClick={() => onPractice(area)}
              >
                {loadingTopic === area.slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {tDashboard("practiceNow")}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={tDashboard("noWeakAreas")} text={tDashboard("noWeakAreasDesc")} href="/tests" />
      )}
    </section>
  );
}

function Recommendation({
  recommendation,
  loading,
  onStart,
  tDashboard,
}: {
  recommendation: DashboardResponse["recommendation"];
  loading: boolean;
  onStart: () => void;
  tDashboard: ReturnType<typeof useTranslations<"dashboard">>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <SectionHeader icon={Sparkles} title={recommendation.title} subtitle={tDashboard("recommendationSubtitle")} />
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{recommendation.text}</p>
      <Button className="mt-4 h-11 w-full" disabled={loading} onClick={onStart}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {recommendation.cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </section>
  );
}

function LastActivity({
  items,
  tDashboard,
  locale,
}: {
  items: ActivityItem[];
  tDashboard: ReturnType<typeof useTranslations<"dashboard">>;
  locale: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <SectionHeader icon={Clock3} title={tDashboard("lastActivity")} subtitle={tDashboard("lastActivitySubtitle")} />
      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li key={`${item.type}-${item.occurred_at}-${index}`}>
              <Link href={item.href} className="block rounded-lg border border-border bg-background p-3 transition hover:bg-muted/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.occurred_at, locale)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={tDashboard("noActivity")} text={tDashboard("noActivityDesc")} href="/daily-plan" />
      )}
    </section>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Target; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-4 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link href={href}>Open</Link>
      </Button>
    </div>
  );
}

function DashboardSkeleton() {
  const rows = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rows.slice(0, 4).map((row) => (
            <div key={row} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map((row) => (
          <div key={row} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </main>
  );
}

function DashboardError({ message }: { message: string }) {
  const tDashboard = useTranslations("dashboard");
  return (
    <main className="mx-auto max-w-2xl rounded-lg border border-destructive/30 bg-card p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <h1 className="font-semibold">{tDashboard("dashboardLoadError")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            {tDashboard("reload")}
          </Button>
        </div>
      </div>
    </main>
  );
}

function EmptyDashboard() {
  const tDashboard = useTranslations("dashboard");
  return (
    <main className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-5 text-center">
      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{tDashboard("preparingDashboard")}</p>
    </main>
  );
}

function formatStepType(type: PlanStepType) {
  const names: Record<PlanStepType, string> = {
    vocabulary_review: "Review vocabulary",
    new_words: "Learn new words",
    grammar: "Grammar lesson",
    reading: "Reading text",
    writing: "Writing task",
    test: "Mini test",
  };
  return names[type];
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(value));
}

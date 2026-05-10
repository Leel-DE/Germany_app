"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronRight, ClipboardList, Loader2, RotateCcw, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CEFRLevel } from "@/types";

type TestSkill = "grammar" | "vocabulary" | "reading" | "listening" | "mixed";
type TestType = "placement" | "practice" | "exam";
type TestStatus = "new" | "completed";
type TestCard = {
  id: string;
  title: string;
  level: CEFRLevel;
  skill: TestSkill;
  type: TestType;
  timeLimit: number | null;
  questionsCount: number;
  description: string;
  bestScore: number | null;
  status: TestStatus;
};

const LEVELS = ["all", "A1", "A2", "B1", "B2"];
const SKILLS = ["all", "grammar", "vocabulary", "reading", "listening", "mixed"];
const TYPES = ["all", "placement", "practice", "exam"];
const STATUSES = ["all", "new", "completed"];

export default function TestsPage() {
  const [tests, setTests] = useState<TestCard[]>([]);
  const [filters, setFilters] = useState({ level: "all", skill: "all", type: "all", status: "all" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "all") params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/api/tests${query ? `?${query}` : ""}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Could not load tests");
        if (alive) setTests(body.tests ?? []);
      })
      .catch((err) => alive && setError(err instanceof Error ? err.message : "Could not load tests"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-6">
      <header className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tests</h1>
            <p className="mt-1 text-sm text-muted-foreground">Check your level, find weak areas, and jump into focused practice.</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Filter label="Level" value={filters.level} values={LEVELS} onChange={(level) => setFilters((prev) => ({ ...prev, level }))} />
          <Filter label="Skill" value={filters.skill} values={SKILLS} onChange={(skill) => setFilters((prev) => ({ ...prev, skill }))} />
          <Filter label="Type" value={filters.type} values={TYPES} onChange={(type) => setFilters((prev) => ({ ...prev, type }))} />
          <Filter label="Status" value={filters.status} values={STATUSES} onChange={(status) => setFilters((prev) => ({ ...prev, status }))} />
        </div>
      </section>

      {loading ? <Skeleton /> : null}
      {error ? <State icon={AlertCircle} title="Tests unavailable" text={error} /> : null}
      {!loading && !error && tests.length === 0 ? <State icon={ClipboardList} title="No tests found" text="Change filters or wait for seed data to load." /> : null}

      {!loading && !error && tests.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => <TestCard key={test.id} test={test} />)}
        </section>
      ) : null}
    </main>
  );
}

function TestCard({ test }: { test: TestCard }) {
  const action = test.status === "completed" ? "Retry" : "Start";
  return (
    <Link href={`/tests/${test.id}`} className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="line-clamp-2 font-semibold leading-snug">{test.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{test.description}</p>
        </div>
        {test.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-success" /> : <ClipboardList className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={test.level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{test.level}</Badge>
        <Badge variant="muted">{test.skill}</Badge>
        <Badge variant="outline">{test.type}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Questions" value={String(test.questionsCount)} />
        <Metric label="Time" value={test.timeLimit ? `${test.timeLimit}m` : "none"} />
        <Metric label="Best" value={test.bestScore === null ? "—" : `${test.bestScore}%`} />
      </div>
      {test.bestScore !== null ? <Progress value={test.bestScore} className="mt-3 h-2" /> : null}
      <div className="mt-4 flex items-center justify-between">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", test.status === "completed" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{test.status}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          {action}
          {test.status === "completed" ? <RotateCcw className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </div>
    </Link>
  );
}

function Filter({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-input/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function State({ icon: Icon, title, text }: { icon: typeof ClipboardList; title: string; text: string }) {
  return (
    <section className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-border bg-card p-6 text-center">
      <div>
        <Icon className="mx-auto h-7 w-7 text-muted-foreground" />
        <h2 className="mt-3 font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </section>
  );
}

function Skeleton() {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />)}</div>;
}

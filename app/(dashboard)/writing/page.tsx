"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronRight, FileText, Loader2, PencilLine, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CEFRLevel, WritingProgressStatus, WritingTaskType, WritingTemplate, WritingTopic } from "@/types";

const LEVELS: ("all" | CEFRLevel)[] = ["all", "A1", "A2", "B1", "B2"];
const TOPICS: ("all" | WritingTopic)[] = ["all", "Wohnung", "Arbeit", "Behörden", "Krankenkasse", "Arzt", "Bewerbung", "Jobcenter", "Einkauf", "Reise", "Ausbildung", "Studium", "Alltag"];
const TYPES: ("all" | WritingTaskType)[] = ["all", "formal_email", "informal_message", "complaint", "request", "application", "appointment", "opinion_text", "exam_letter"];
const STATUSES: ("all" | WritingProgressStatus)[] = ["all", "new", "in_progress", "completed"];

export default function WritingPage() {
  const [tasks, setTasks] = useState<WritingTemplate[]>([]);
  const [filters, setFilters] = useState({ level: "all", topic: "all", type: "all", status: "all" });
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
    fetch(`/api/writing/tasks${query ? `?${query}` : ""}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Could not load writing tasks");
        if (alive) setTasks(body.tasks ?? []);
      })
      .catch((err) => alive && setError(err instanceof Error ? err.message : "Could not load writing tasks"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-6">
      <header className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PencilLine className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight">Writing</h1>
            <p className="mt-1 text-sm text-muted-foreground">Train real German texts for life, work and exams.</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Level" value={filters.level} values={LEVELS} onChange={(level) => setFilters((prev) => ({ ...prev, level }))} />
          <FilterSelect label="Topic" value={filters.topic} values={TOPICS} onChange={(topic) => setFilters((prev) => ({ ...prev, topic }))} />
          <FilterSelect label="Type" value={filters.type} values={TYPES} onChange={(type) => setFilters((prev) => ({ ...prev, type }))} />
          <FilterSelect label="Status" value={filters.status} values={STATUSES} onChange={(status) => setFilters((prev) => ({ ...prev, status }))} />
        </div>
      </section>

      {loading ? <TaskSkeleton /> : null}
      {error ? <State icon={AlertCircle} title="Writing tasks could not be loaded" text={error} /> : null}
      {!loading && !error && tasks.length === 0 ? <State icon={FileText} title="No tasks found" text="Change filters or come back after seed data is loaded." /> : null}

      {!loading && !error && tasks.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </section>
      ) : null}
    </main>
  );
}

function TaskCard({ task }: { task: WritingTemplate }) {
  const action = task.status === "completed" ? "Review" : task.status === "in_progress" ? "Continue" : "Start";
  return (
    <Link href={`/writing/${task.id}`} className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug">{task.title}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={task.level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{task.level}</Badge>
            <Badge variant="muted">{task.topic}</Badge>
            <Badge variant="outline">{typeLabel(task.type)}</Badge>
          </div>
        </div>
        <StatusIcon status={task.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Metric label="Time" value={`${task.estimatedMinutes}m`} />
        <Metric label="Min" value={`${task.minWords}w`} />
        <Metric label="Score" value={task.lastScore === null ? "—" : `${task.lastScore}`} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusClass(task.status))}>{statusLabel(task.status)}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          {action}
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-input/50 px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
      >
        {values.map((item) => (
          <option key={item} value={item}>{item === "all" ? `All ${label.toLowerCase()}` : typeLabel(item)}</option>
        ))}
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

function StatusIcon({ status }: { status: WritingProgressStatus }) {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />;
  if (status === "in_progress") return <RotateCcw className="h-5 w-5 shrink-0 text-warning" />;
  return <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />;
}

function State({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
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

function TaskSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function typeLabel(value: string) {
  return value.replaceAll("_", " ");
}

function statusLabel(status: WritingProgressStatus) {
  if (status === "in_progress") return "In progress";
  return status[0].toUpperCase() + status.slice(1);
}

function statusClass(status: WritingProgressStatus) {
  if (status === "completed") return "bg-success/10 text-success";
  if (status === "in_progress") return "bg-warning/10 text-warning";
  return "bg-muted text-muted-foreground";
}

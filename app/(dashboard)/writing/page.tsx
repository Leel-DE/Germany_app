"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Loader2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

type CEFRLevel = "A1" | "A2" | "B1" | "B2";
type Status = "new" | "in_progress" | "completed";

interface TaskDTO {
  id: string;
  title: string;
  type: string;
  topic: string;
  cefr_level: CEFRLevel;
  instructions: string;
  min_words: number;
  estimated_minutes: number;
  progress: {
    status: Status;
    best_score: number | null;
    attempts_count: number;
  } | null;
}

interface FacetsDTO {
  levels: string[];
  topics: string[];
  types: string[];
}

const ALL = "__all__";

export default function WritingListPage() {
  const t = useTranslations("writing");
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [facets, setFacets] = useState<FacetsDTO>({ levels: [], topics: [], types: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [level, setLevel] = useState<string>(ALL);
  const [topic, setTopic] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (level !== ALL) params.set("level", level);
    if (topic !== ALL) params.set("topic", topic);
    if (type !== ALL) params.set("type", type);
    if (status !== ALL) params.set("status", status);
    if (debouncedSearch) params.set("q", debouncedSearch);
    const qs = params.toString();
    return `/api/writing/tasks${qs ? `?${qs}` : ""}`;
  }, [level, topic, type, status, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(requestUrl, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? t("loadError"));
        return data as { tasks: TaskDTO[]; facets: FacetsDTO };
      })
      .then((data) => {
        if (cancelled) return;
        setTasks(data.tasks ?? []);
        setFacets(data.facets ?? { levels: [], topics: [], types: [] });
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [requestUrl, t]);

  const hasFilters = level !== ALL || topic !== ALL || type !== ALL || status !== ALL || debouncedSearch.length > 0;

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </header>

      <section className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <FilterSelect label={t("filterLevel")} value={level} onChange={setLevel} options={facets.levels} allLabel={t("all")} />
          <FilterSelect label={t("filterTopic")} value={topic} onChange={setTopic} options={facets.topics} allLabel={t("all")} />
          <FilterSelect
            label={t("filterType")}
            value={type}
            onChange={setType}
            options={facets.types}
            allLabel={t("all")}
            renderOption={(value) => formatType(value)}
          />
          <FilterSelect
            label={t("filterStatus")}
            value={status}
            onChange={setStatus}
            options={["new", "in_progress", "completed"]}
            allLabel={t("all")}
            renderOption={(value) =>
              value === "new" ? t("statusNew") : value === "in_progress" ? t("statusInProgress") : t("statusCompleted")
            }
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              setLevel(ALL);
              setTopic(ALL);
              setType(ALL);
              setStatus(ALL);
              setSearch("");
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            {t("clearFilters")}
          </Button>
        )}
      </section>

      {loading ? (
        <CenteredState>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CenteredState>
      ) : error ? (
        <CenteredState>
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setSearch((s) => s)}>
            {t("retry")}
          </Button>
        </CenteredState>
      ) : tasks.length === 0 ? (
        <CenteredState>
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("noTasks")}</p>
        </CenteredState>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/writing/${task.id}`}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={task.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{task.cefr_level}</Badge>
                    <Badge variant="muted">{task.topic}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {formatType(task.type)}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {task.min_words} {t("wordsShort")} · {task.estimated_minutes} {t("minutesShort")}
                    </span>
                  </div>
                  <StatusLine task={task} />
                </div>
                <div className="ml-2 flex flex-col items-end gap-1">
                  <CTABadge task={task} t={t} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
  renderOption?: (value: string) => string;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <option value={ALL}>{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {renderOption ? renderOption(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusLine({ task }: { task: TaskDTO }) {
  const t = useTranslations("writing");
  const status = task.progress?.status ?? "new";
  const score = task.progress?.best_score;
  const attempts = task.progress?.attempts_count ?? 0;

  if (status === "new") {
    return <p className="text-[11px] text-muted-foreground">{t("statusNew")}</p>;
  }
  return (
    <p className="text-[11px] text-muted-foreground">
      {status === "completed" ? t("statusCompleted") : t("statusInProgress")}
      {score !== null && score !== undefined ? ` · ${t("lastScore")}: ${score}` : ""}
      {attempts > 0 ? ` · ${attempts} ${t("attemptsShort")}` : ""}
    </p>
  );
}

function CTABadge({ task, t }: { task: TaskDTO; t: ReturnType<typeof useTranslations> }) {
  const status = task.progress?.status ?? "new";
  const text = status === "completed" ? t("review") : status === "in_progress" ? t("continue") : t("start");
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">{text}</span>
  );
}

function formatType(type: string): string {
  return type.replace(/_/g, " ");
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[35vh] place-items-center gap-2 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

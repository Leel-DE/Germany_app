"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BookOpen, ChevronRight, Clock, Loader2, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CEFRLevel, ReadingText } from "@/types";
import { useTranslations } from "next-intl";

const LEVELS: Array<"All" | CEFRLevel> = ["All", "A1", "A2", "B1", "B2"];

export default function ReadingPage() {
  const t = useTranslations("reading");
  const loadErrorText = t("loadError");
  const generateErrorText = t("generateError");
  const router = useRouter();
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [profile, setProfile] = useState<{
    currentLevel: CEFRLevel;
    targetLevel: CEFRLevel;
    profession: string | null;
    weakAreas: string[];
    preferredTopics: string[];
  } | null>(null);
  const [level, setLevel] = useState<"All" | CEFRLevel>("All");
  const [topic, setTopic] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (level !== "All") params.set("level", level);
    if (topic !== "All") params.set("topic", topic);
    if (search.trim()) params.set("q", search.trim());
    return `/api/reading/texts${params.size ? `?${params}` : ""}`;
  }, [level, search, topic]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(requestUrl, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? loadErrorText);
        return data as {
          texts?: ReadingText[];
          topics?: string[];
          error?: string;
          profile?: {
            currentLevel: CEFRLevel;
            targetLevel: CEFRLevel;
            profession: string | null;
            weakAreas: string[];
            preferredTopics: string[];
          };
        };
      })
      .then((data) => {
        if (cancelled) return;
        setTexts(data.texts ?? []);
        setTopics(data.topics ?? []);
        setProfile(data.profile ?? null);
        setError(data.error ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : loadErrorText);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadErrorText, requestUrl]);

  const generateText = async () => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/reading/texts/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: level === "All" ? profile?.targetLevel ?? undefined : level,
          topic: topic === "All" ? undefined : topic,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? generateErrorText);
      router.push(`/reading/${data.text.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : generateErrorText);
    } finally {
      setGenerating(false);
    }
  };
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">{t("title")}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button onClick={generateText} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {t("generateAi")}
        </Button>
      </div>

      {profile && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{profile.currentLevel} → {profile.targetLevel}</span>
          {profile.profession && <Badge variant="outline">{profile.profession}</Badge>}
          {profile.weakAreas.slice(0, 3).map((area) => <Badge key={area} variant="warning">{area}</Badge>)}
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-input bg-input/50 pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {LEVELS.map((item) => (
            <FilterButton key={item} active={level === item} onClick={() => setLevel(item)}>
              {item}
            </FilterButton>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...topics].map((item) => (
            <FilterButton key={item} active={topic === item} onClick={() => setTopic(item)}>
              {item}
            </FilterButton>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {loading && <State><Loader2 className="h-6 w-6 animate-spin" />{t("loadingTexts")}</State>}
      {!loading && !error && texts.length === 0 && <State><BookOpen className="h-6 w-6" />{t("noTexts")}</State>}

      <div className="space-y-2">
        {texts.map((text) => (
          <Link key={text.id} href={`/reading/${text.id}`}>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{text.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant={text.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{text.cefr_level}</Badge>
                  <Badge variant="muted">{text.topic}</Badge>
                  {text.recommended && <Badge variant="success">{t("recommended")}</Badge>}
                  {text.read_time_min && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {text.read_time_min} {t("min")}
                    </span>
                  )}
                </div>
                {text.recommendation_reason && (
                  <p className="mt-1 text-xs text-muted-foreground">{text.recommendation_reason}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[30vh] place-items-center gap-2 text-center text-sm text-muted-foreground">{children}</div>;
}

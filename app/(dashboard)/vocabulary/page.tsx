"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BookOpen, Loader2, Plus, Search, Sparkles, Trash2, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, getArticleColor } from "@/lib/utils";
import type { CEFRLevel, Word, WordType } from "@/types";
import { useTranslations } from "next-intl";

const LEVELS: (CEFRLevel | "All")[] = ["All", "A1", "A2", "B1", "B2"];

type VocabularyWord = Word & { word_type: WordType };
type Notice = { type: "success" | "error"; text: string } | null;

export default function VocabularyPage() {
  const t = useTranslations("vocabulary");
  const loadErrorText = t("loadError");
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState<CEFRLevel | "All">("All");
  const [activeTopic, setActiveTopic] = useState("All");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [deleteTarget, setDeleteTarget] = useState<VocabularyWord | null>(null);

  const loadWords = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeLevel !== "All") params.set("level", activeLevel);
    if (activeTopic !== "All") params.set("topic", activeTopic);

    setLoading(true);
    try {
      const res = await fetch(`/api/vocabulary?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(loadErrorText);
      const data = await res.json();
      setWords(data.words ?? []);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : loadErrorText });
    } finally {
      setLoading(false);
    }
  }, [activeLevel, activeTopic, loadErrorText, search]);

  useEffect(() => {
    void loadWords();
  }, [loadWords]);

  const topics = useMemo(() => ["All", ...Array.from(new Set(words.map((word) => word.topic).filter(Boolean)))], [words]);

  const generateWords = async () => {
    setGenerating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/vocabulary/generate-ai", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("generateError"));
      setWords((prev) => mergeWords(data.words ?? [], prev));
      setNotice({ type: "success", text: t("generatedCount", { count: data.created ?? 0 }) });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : t("generateError") });
    } finally {
      setGenerating(false);
    }
  };

  const deleteWord = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/vocabulary/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? t("deleteError"));
      setWords((prev) => prev.filter((word) => word.id !== deleteTarget.id));
      setNotice({ type: "success", text: data.deleted === "word" ? t("personalDeleted") : t("removedFromVocab") });
      setDeleteTarget(null);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : t("deleteError") });
    } finally {
      setDeleting(false);
    }
  };

  const speak = (text: string) => {
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE";
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t("title")}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("wordsFromDb", { count: words.length })}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" disabled={generating} onClick={generateWords}>
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{t("generate20")}</span>
            <span className="sm:hidden">AI</span>
          </Button>
          <Link href="/vocabulary/add">
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />{t("add")}</Button>
          </Link>
        </div>
      </div>

      {notice && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
            notice.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t("searchPlaceholder")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <FilterRow values={LEVELS} active={activeLevel} onSelect={(value) => setActiveLevel(value as CEFRLevel | "All")} />
      <FilterRow values={topics as string[]} active={activeTopic} onSelect={setActiveTopic} />

      {loading && <State icon={<Loader2 className="h-6 w-6 animate-spin" />} text={t("loading")} />}
      {!loading && words.length === 0 && <State icon={<BookOpen className="h-6 w-6" />} text={t("noWords")} />}

      <div className="space-y-2">
        {words.map((word) => (
          <WordRow key={word.id} word={word} onSpeak={speak} onDelete={setDeleteTarget} />
        ))}
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTarget?.is_system
                ? t("deleteGlobal")
                : t("deletePersonal")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" className="flex-1" disabled={deleting} onClick={deleteWord}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterRow({ values, active, onSelect }: { values: string[]; active: string; onSelect: (value: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
      {values.map((value) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            active === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function WordRow({ word, onSpeak, onDelete }: {
  word: VocabularyWord;
  onSpeak: (text: string) => void;
  onDelete: (word: VocabularyWord) => void;
}) {
  return (
    <Link href={`/vocabulary/${word.id}`}>
      <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {word.article && <span className={cn("text-sm font-semibold", getArticleColor(word.article))}>{word.article}</span>}
              <span className="font-bold">{word.german.replace(/^(der|die|das)\s/i, "")}</span>
              <Badge variant={word.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{word.cefr_level}</Badge>
              {!word.is_system && <Badge variant="outline">AI</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{word.translation_ru}</p>
            {word.example_de && <p className="mt-1.5 line-clamp-1 text-xs italic text-muted-foreground/70">{word.example_de}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={(event) => { event.preventDefault(); onSpeak(word.german); }}
              aria-label="Speak"
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(event) => { event.preventDefault(); onDelete(word); }}
              aria-label="Delete"
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function State({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="grid place-items-center gap-2 py-12 text-sm text-muted-foreground">{icon}<p>{text}</p></div>;
}

function mergeWords(created: VocabularyWord[], current: VocabularyWord[]) {
  const existing = new Set(current.map((word) => word.id));
  return [...created.filter((word) => !existing.has(word.id)), ...current];
}

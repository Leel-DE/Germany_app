"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Plus, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReadingText, WordType } from "@/types";

type Notice = { type: "success" | "error"; text: string } | null;

const WORD_TYPES: WordType[] = ["noun", "verb", "adjective", "adverb", "phrase", "preposition", "conjunction"];

export function ReadingTextView({ text }: { text: ReadingText }) {
  const tokens = useMemo(() => tokenizeText(text.content), [text.content]);
  const [selectedWord, setSelectedWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [article, setArticle] = useState("");
  const [wordType, setWordType] = useState<WordType>("noun");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const openWord = (word: string) => {
    const clean = normalizeSelectedWord(word);
    if (!clean) return;
    setSelectedWord(clean);
    setTranslation("");
    setArticle("");
    setWordType(/^[A-ZÄÖÜ]/.test(clean) ? "noun" : "verb");
    setNotice(null);
  };

  const closePopover = () => {
    setSelectedWord("");
    setNotice(null);
  };

  const speak = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "de-DE";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const addToVocabulary = async () => {
    if (!selectedWord || !translation.trim()) {
      setNotice({ type: "error", text: "Add a Russian translation before saving." });
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          german: selectedWord,
          translation_ru: translation.trim(),
          article: wordType === "noun" ? article || undefined : undefined,
          word_type: wordType,
          cefr_level: text.cefr_level,
          topic: text.topic,
          example_de: findExampleSentence(text.content, selectedWord),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not add word.");
      setNotice({ type: "success", text: "Added to vocabulary." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not add word." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="prose prose-invert max-w-none text-base leading-8 text-foreground">
          {tokens.map((token, index) => {
            if (token.type === "newline") return <br key={`${token.value}-${index}`} />;
            if (token.type === "space") return <span key={`${token.value}-${index}`}>{token.value}</span>;
            if (token.type === "punctuation") return <span key={`${token.value}-${index}`}>{token.value}</span>;

            return (
              <button
                key={`${token.value}-${index}`}
                type="button"
                onClick={() => openWord(token.value)}
                className={cn(
                  "rounded px-0.5 text-left transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selectedWord === normalizeSelectedWord(token.value) && "bg-primary/10 text-primary"
                )}
              >
                {token.value}
              </button>
            );
          })}
        </div>
      </section>

      {selectedWord && (
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Selected word</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xl font-bold">{selectedWord}</p>
                <button
                  type="button"
                  onClick={() => speak(selectedWord)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                  aria-label="Play pronunciation"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={closePopover}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close word popover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_140px_120px]">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Russian translation</span>
              <input
                value={translation}
                onChange={(event) => setTranslation(event.target.value)}
                placeholder="например: усилие"
                className="h-10 w-full rounded-lg border border-input bg-input/50 px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Type</span>
              <select
                value={wordType}
                onChange={(event) => setWordType(event.target.value as WordType)}
                className="h-10 w-full rounded-lg border border-input bg-input/50 px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
              >
                {WORD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Article</span>
              <select
                value={article}
                onChange={(event) => setArticle(event.target.value)}
                disabled={wordType !== "noun"}
                className="h-10 w-full rounded-lg border border-input bg-input/50 px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="">-</option>
                <option value="der">der</option>
                <option value="die">die</option>
                <option value="das">das</option>
              </select>
            </label>
          </div>

          {notice && (
            <div className={cn(
              "mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
              notice.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {notice.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <X className="mt-0.5 h-4 w-4" />}
              <span>{notice.text}</span>
            </div>
          )}

          <Button className="mt-3 w-full" onClick={addToVocabulary} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add to vocabulary
          </Button>
        </section>
      )}
    </div>
  );
}

type Token =
  | { type: "word"; value: string }
  | { type: "space"; value: string }
  | { type: "punctuation"; value: string }
  | { type: "newline"; value: string };

function tokenizeText(value: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\r?\n)|([A-Za-zÄÖÜäöüß]+(?:[-'][A-Za-zÄÖÜäöüß]+)*)|(\s+)|(.)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value))) {
    if (match[1]) tokens.push({ type: "newline", value: match[1] });
    else if (match[2]) tokens.push({ type: "word", value: match[2] });
    else if (match[3]) tokens.push({ type: "space", value: match[3] });
    else tokens.push({ type: "punctuation", value: match[4] ?? "" });
  }

  return tokens;
}

function normalizeSelectedWord(value: string) {
  return value.replace(/^[^A-Za-zÄÖÜäöüß]+|[^A-Za-zÄÖÜäöüß]+$/g, "").trim();
}

function findExampleSentence(content: string, word: string) {
  const sentences = content.match(/[^.!?]+[.!?]/g) ?? [content];
  const normalized = word.toLowerCase();
  return sentences.find((sentence) => sentence.toLowerCase().includes(normalized))?.trim().slice(0, 300);
}

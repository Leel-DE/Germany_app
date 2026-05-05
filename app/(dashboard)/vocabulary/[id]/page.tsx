"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getArticleColor } from "@/lib/utils";
import type { Word } from "@/types";
import { useTranslations } from "next-intl";

export default function WordDetailPage() {
  const t = useTranslations("vocabulary");
  const params = useParams<{ id: string }>();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vocabulary/${params.id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setWord(data.word ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const speak = (text: string) => {
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE";
      window.speechSynthesis.speak(utt);
    }
  };

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" /></State>;
  if (!word) return <State>{t("wordNotFound")}</State>;

  const germanBase = word.german.replace(/^(der|die|das)\s/i, "");

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <Link href="/vocabulary"><Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="flex-1 text-lg font-semibold">{t("wordCard")}</h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {word.article && <span className={cn("text-2xl font-bold", getArticleColor(word.article))}>{word.article}</span>}
          <span className="text-3xl font-bold">{germanBase}</span>
          <button onClick={() => speak(word.german)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
        {word.plural && <p className="mt-2 text-sm text-muted-foreground">{t("plural")}: {word.plural}</p>}
        <p className="mt-4 text-xl font-semibold">{word.translation_ru}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge variant={word.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{word.cefr_level}</Badge>
          {word.topic && <Badge variant="muted">{word.topic}</Badge>}
          <Badge variant="outline">{word.word_type}</Badge>
        </div>
      </div>

      {word.example_de && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm de-text">{word.example_de}</p>
          {word.example_ru && <p className="mt-1 text-xs text-muted-foreground">{word.example_ru}</p>}
        </div>
      )}

      {word.notes && <div className="rounded-lg border border-border bg-card p-4 text-sm">{word.notes}</div>}
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[50vh] place-items-center text-muted-foreground">{children}</div>;
}

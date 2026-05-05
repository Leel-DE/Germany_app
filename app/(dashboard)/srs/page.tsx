"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getArticleColor } from "@/lib/utils";
import type { SRSRating } from "@/types";
import { useTranslations } from "next-intl";

type Card = {
  id: string;
  german: string;
  article?: string;
  plural?: string;
  translation_ru: string;
  example_de?: string;
  example_ru?: string;
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
};

const RATINGS: { rating: SRSRating; label: string }[] = [
  { rating: "again", label: "Again" },
  { rating: "hard", label: "Hard" },
  { rating: "good", label: "Good" },
  { rating: "easy", label: "Easy" },
];

export default function SRSPage() {
  const t = useTranslations("vocabulary");
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<SRSRating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });

  useEffect(() => {
    fetch("/api/vocabulary/review", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCards(data.cards ?? []))
      .finally(() => setLoading(false));
  }, []);

  const speak = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE";
      window.speechSynthesis.speak(utt);
    }
  };

  const rate = async (rating: SRSRating) => {
    const card = cards[index];
    if (!card) return;
    await fetch(`/api/vocabulary/${card.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    setStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    setFlipped(false);
    setIndex((prev) => prev + 1);
  };

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" /></State>;

  const card = cards[index];
  if (!card) {
    const total = Object.values(stats).reduce((sum, value) => sum + value, 0);
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <div>
          <h1 className="text-2xl font-bold">{t("reviewComplete")}</h1>
          <p className="text-muted-foreground">{t("cardsReviewed", { count: total })}</p>
        </div>
        <Link href="/home"><Button>{t("backToDashboard")}</Button></Link>
      </div>
    );
  }

  const progress = cards.length ? Math.round((index / cards.length) * 100) : 0;
  const germanBase = card.german.replace(/^(der|die|das)\s/i, "");

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <Link href="/home"><Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Card {index + 1} of {cards.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <button
        className={cn("flex min-h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 bg-card p-8 text-center", flipped ? "border-primary/30" : "border-border")}
        onClick={() => { setFlipped(true); speak(card.german); }}
      >
        {!flipped ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              {card.article && <span className={cn("text-2xl font-bold", getArticleColor(card.article))}>{card.article}</span>}
              <span className="text-4xl font-bold">{germanBase}</span>
            </div>
              {card.plural && <p className="text-sm text-muted-foreground">{t("plural")}: {card.plural}</p>}
            <p className="text-sm text-muted-foreground">{t("tapToReveal")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">{card.german}</span>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="border-y border-border py-3 text-2xl font-semibold">{card.translation_ru}</p>
            {card.example_de && <p className="text-sm de-text">{card.example_de}</p>}
            {card.example_ru && <p className="text-xs text-muted-foreground">{card.example_ru}</p>}
          </div>
        )}
      </button>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map(({ rating, label }) => (
            <Button key={rating} variant="outline" onClick={() => rate(rating)}>{label}</Button>
          ))}
        </div>
      )}
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[50vh] place-items-center text-muted-foreground">{children}</div>;
}

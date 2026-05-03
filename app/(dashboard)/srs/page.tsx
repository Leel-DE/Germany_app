"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getArticleColor } from "@/lib/utils";
import { calculateNextReview, getInitialCard } from "@/lib/srs/sm2";
import type { SRSRating } from "@/types";

interface SRSCardData {
  id: string;
  german: string;
  article?: string;
  plural?: string;
  translation_ru: string;
  example_de?: string;
  example_ru?: string;
  word_type: string;
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
}

const DEMO_CARDS: SRSCardData[] = [
  { id: "1", german: "die Wohnung", article: "die", plural: "die Wohnungen", translation_ru: "квартира",
    example_de: "Ich suche eine Wohnung.", example_ru: "Я ищу квартиру.", word_type: "noun", ...getInitialCard() },
  { id: "2", german: "arbeiten", translation_ru: "работать",
    example_de: "Sie arbeitet in Berlin.", example_ru: "Она работает в Берлине.", word_type: "verb", ...getInitialCard() },
  { id: "3", german: "der Termin", article: "der", plural: "die Termine", translation_ru: "встреча, запись",
    example_de: "Ich habe einen Arzttermin.", example_ru: "У меня приём у врача.", word_type: "noun", ...getInitialCard() },
  { id: "4", german: "beantragen", translation_ru: "подавать заявление",
    example_de: "Ich möchte einen Ausweis beantragen.", example_ru: "Я хочу оформить удостоверение.", word_type: "verb", ...getInitialCard() },
  { id: "5", german: "die Krankenkasse", article: "die", plural: "die Krankenkassen", translation_ru: "касса медицинского страхования",
    example_de: "Ich bin bei der TK versichert.", example_ru: "Я застрахован в TK.", word_type: "noun", ...getInitialCard() },
];

const RATING_CONFIG = [
  { rating: "again" as SRSRating, label: "Снова", emoji: "❌", desc: "Не помню", color: "again" },
  { rating: "hard" as SRSRating, label: "Тяжело", emoji: "😓", desc: "С трудом", color: "hard" },
  { rating: "good" as SRSRating, label: "Хорошо", emoji: "✅", desc: "Вспомнил", color: "good" },
  { rating: "easy" as SRSRating, label: "Легко", emoji: "🚀", desc: "Сразу", color: "easy" },
] as const;

export default function SRSPage() {
  const [cards, setCards] = useState(DEMO_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const speak = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE"; utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }, []);

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true);
      const card = cards[currentIndex];
      if (card) speak(card.german);
    }
  };

  const handleRate = (rating: SRSRating) => {
    const card = cards[currentIndex];
    if (!card) return;

    const result = calculateNextReview(
      { easeFactor: card.easeFactor, intervalDays: card.intervalDays, repetitionCount: card.repetitionCount },
      rating
    );

    setStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }));

    // If "again", push card to end of queue
    const updated = cards.map((c, i) =>
      i === currentIndex
        ? { ...c, easeFactor: result.newEaseFactor, intervalDays: result.newInterval, repetitionCount: result.newRepetitionCount }
        : c
    );

    if (rating === "again") {
      const [current, ...rest] = updated.slice(currentIndex);
      setCards([...updated.slice(0, currentIndex), ...rest, current]);
    }

    setFlipped(false);
    if (currentIndex >= cards.length - 1 && rating !== "again") {
      setDone(true);
    } else {
      setCurrentIndex(prev => rating === "again" ? Math.min(prev + 1, cards.length - 1) : prev + 1);
    }
  };

  if (done) {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const correct = stats.good + stats.easy;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-slide-up px-4 space-y-6">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Тренировка завершена!</h2>
          <p className="text-muted-foreground mt-1">Повторено {total} карточек</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {RATING_CONFIG.map(({ rating, label, emoji }) => (
            <div key={rating} className="p-3 rounded-xl bg-muted text-center">
              <p className="text-2xl">{emoji}</p>
              <p className="text-lg font-bold">{stats[rating]}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-primary/10 w-full max-w-xs">
          <p className="text-3xl font-bold text-primary">{accuracy}%</p>
          <p className="text-sm text-muted-foreground">точность ответов</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => { setCurrentIndex(0); setDone(false); setStats({ again: 0, hard: 0, good: 0, easy: 0 }); setFlipped(false); }}>
            <RotateCcw className="w-4 h-4" />
            Ещё раз
          </Button>
          <Link href="/home" className="flex-1">
            <Button className="w-full">На главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];
  if (!card) return null;
  const germanBase = card.german.replace(/^(der|die|das)\s/i, "");
  const progress = Math.round((currentIndex / cards.length) * 100);

  return (
    <div className="space-y-5 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/home">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Карточка {currentIndex + 1} из {cards.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className={cn(
          "rounded-2xl border-2 bg-card min-h-[300px] flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 select-none",
          flipped ? "border-primary/30 shadow-md" : "border-border hover:border-primary/20 hover:shadow-sm active:scale-[0.98]"
        )}
        onClick={handleFlip}
      >
        {!flipped ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {card.article && (
                <span className={cn("text-2xl font-bold", getArticleColor(card.article))}>
                  {card.article}
                </span>
              )}
              <span className="text-4xl font-bold">{germanBase}</span>
            </div>
            {card.plural && (
              <p className="text-sm text-muted-foreground">Мн.ч: {card.plural}</p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); speak(card.german); }}
              className="mx-auto flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Произношение</span>
            </button>
            <p className="text-muted-foreground text-sm mt-4">Нажми, чтобы увидеть перевод</p>
          </div>
        ) : (
          <div className="text-center space-y-4 w-full animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              {card.article && (
                <span className={cn("text-xl font-bold", getArticleColor(card.article))}>{card.article}</span>
              )}
              <span className="text-2xl font-bold">{germanBase}</span>
              <button onClick={() => speak(card.german)} className="text-muted-foreground hover:text-primary transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 border-t border-b border-border/50">
              <p className="text-2xl font-semibold">{card.translation_ru}</p>
            </div>
            {card.example_de && (
              <div className="text-left bg-muted/50 rounded-xl p-3 space-y-1">
                <div className="flex items-start gap-2">
                  <p className="de-text text-sm leading-relaxed flex-1">{card.example_de}</p>
                  <button onClick={() => speak(card.example_de!)} className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{card.example_ru}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2 animate-fade-slide-up">
          {RATING_CONFIG.map(({ rating, label, emoji, desc, color }) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 hover:shadow-sm",
                color === "again" && "border-again/30 bg-again/5 hover:bg-again/10 hover:border-again/50",
                color === "hard" && "border-hard/30 bg-hard/5 hover:bg-hard/10 hover:border-hard/50",
                color === "good" && "border-good/30 bg-good/5 hover:bg-good/10 hover:border-good/50",
                color === "easy" && "border-easy/30 bg-easy/5 hover:bg-easy/10 hover:border-easy/50",
              )}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <p className="text-center text-xs text-muted-foreground">
          Подумай и нажми на карточку
        </p>
      )}
    </div>
  );
}

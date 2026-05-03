"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Volume2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, getArticleColor } from "@/lib/utils";
import type { Word, CEFRLevel, WordType } from "@/types";

// Demo words
const DEMO_WORDS: Word[] = [
  {
    id: "1", german: "die Wohnung", translation_ru: "квартира", translation_en: "apartment",
    article: "die", plural: "die Wohnungen", word_type: "noun", cefr_level: "A2",
    topic: "Wohnung", frequency_rank: 312, example_de: "Ich miete eine Wohnung in der Stadtmitte.",
    example_ru: "Я снимаю квартиру в центре города.", is_system: true, created_at: new Date().toISOString()
  },
  {
    id: "2", german: "arbeiten", translation_ru: "работать", translation_en: "to work",
    word_type: "verb", cefr_level: "A1", topic: "Arbeit", frequency_rank: 45,
    example_de: "Ich arbeite in einem Büro.", example_ru: "Я работаю в офисе.",
    is_system: true, created_at: new Date().toISOString()
  },
  {
    id: "3", german: "der Termin", translation_ru: "встреча, запись", translation_en: "appointment",
    article: "der", plural: "die Termine", word_type: "noun", cefr_level: "A2",
    topic: "Alltag", frequency_rank: 520, example_de: "Ich habe einen Termin beim Arzt.",
    example_ru: "У меня запись к врачу.", is_system: true, created_at: new Date().toISOString()
  },
  {
    id: "4", german: "beantragen", translation_ru: "подавать заявление, оформлять",
    translation_en: "to apply for", word_type: "verb", cefr_level: "B1",
    topic: "Behörden", frequency_rank: 1240, example_de: "Ich möchte einen Personalausweis beantragen.",
    example_ru: "Я хочу оформить удостоверение личности.", is_system: true, created_at: new Date().toISOString()
  },
  {
    id: "5", german: "das Krankenhaus", translation_ru: "больница", translation_en: "hospital",
    article: "das", plural: "die Krankenhäuser", word_type: "noun", cefr_level: "A2",
    topic: "Gesundheit", frequency_rank: 680, example_de: "Er liegt im Krankenhaus.",
    example_ru: "Он лежит в больнице.", is_system: true, created_at: new Date().toISOString()
  },
  {
    id: "6", german: "die Bewerbung", translation_ru: "заявление о приёме на работу",
    translation_en: "job application", article: "die", plural: "die Bewerbungen",
    word_type: "noun", cefr_level: "B1", topic: "Arbeit", frequency_rank: 890,
    example_de: "Ich schreibe eine Bewerbung für die Stelle.", example_ru: "Я пишу заявление на эту должность.",
    is_system: true, created_at: new Date().toISOString()
  },
];

const TOPICS = ["Все", "Wohnung", "Arbeit", "Alltag", "Behörden", "Gesundheit", "Reisen"];
const LEVELS: (CEFRLevel | "Все")[] = ["Все", "A1", "A2", "B1", "B2"];

export default function VocabularyPage() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("Все");
  const [activeLevel, setActiveLevel] = useState<CEFRLevel | "Все">("Все");
  const [activeType] = useState<WordType | "Все">("Все");

  const filtered = DEMO_WORDS.filter((w) => {
    const matchSearch = !search ||
      w.german.toLowerCase().includes(search.toLowerCase()) ||
      w.translation_ru.toLowerCase().includes(search.toLowerCase());
    const matchTopic = activeTopic === "Все" || w.topic === activeTopic;
    const matchLevel = activeLevel === "Все" || w.cefr_level === activeLevel;
    const matchType = activeType === "Все" || w.word_type === activeType;
    return matchSearch && matchTopic && matchLevel && matchType;
  });

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE";
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Словарь</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{DEMO_WORDS.length} слов · 847 выучено</p>
        </div>
        <Link href="/vocabulary/add">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Добавить
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск: квартира, arbeiten..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Level filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeLevel === level
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Topic filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTopic(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
              activeTopic === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Words list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
        {filtered.map((word) => (
          <Link key={word.id} href={`/vocabulary/${word.id}`}>
            <div className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-all active:scale-[0.99] group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {word.article && (
                      <span className={cn("text-sm font-semibold", getArticleColor(word.article))}>
                        {word.article}
                      </span>
                    )}
                    <span className="text-base font-bold">{word.german.replace(/^(der|die|das)\s/i, "")}</span>
                    {word.plural && (
                      <span className="text-xs text-muted-foreground">· {word.plural}</span>
                    )}
                    <Badge
                      variant={word.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}
                      className="ml-auto"
                    >
                      {word.cefr_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{word.translation_ru}</p>
                  {word.example_de && (
                    <p className="text-xs text-muted-foreground/70 mt-1.5 italic line-clamp-1">
                      {word.example_de}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); speak(word.german); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shrink-0 mt-0.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {word.topic && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {word.topic}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {word.word_type}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

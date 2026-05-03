"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Volume2, BookmarkPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, getArticleColor } from "@/lib/utils";

// Mock data lookup
const WORDS: Record<string, {
  id: string; german: string; article?: string; plural?: string;
  translation_ru: string; translation_en?: string; word_type: string;
  cefr_level: string; topic?: string; example_de?: string; example_ru?: string;
  notes?: string;
  verbData?: {
    praesens_ich: string; praesens_du: string; praesens_er: string;
    praeteritum: string; perfekt: string; partizip_2: string; hilfsverb: string;
    is_trennbar: boolean; case_governance?: string;
  };
  nounData?: {
    gen_singular?: string; dat_singular?: string; akk_singular?: string;
    gen_plural?: string; dat_plural?: string; akk_plural?: string;
  };
}> = {
  "2": {
    id: "2", german: "arbeiten", translation_ru: "работать", translation_en: "to work",
    word_type: "verb", cefr_level: "A1", topic: "Arbeit",
    example_de: "Ich arbeite in einem Büro in Berlin.",
    example_ru: "Я работаю в офисе в Берлине.",
    notes: "Регулярный глагол. Часто используется с предлогами in, bei, als.",
    verbData: {
      praesens_ich: "arbeite", praesens_du: "arbeitest", praesens_er: "arbeitet",
      praeteritum: "arbeitete", perfekt: "hat gearbeitet", partizip_2: "gearbeitet",
      hilfsverb: "haben", is_trennbar: false, case_governance: "—"
    }
  },
  "1": {
    id: "1", german: "die Wohnung", article: "die", plural: "die Wohnungen",
    translation_ru: "квартира", translation_en: "apartment",
    word_type: "noun", cefr_level: "A2", topic: "Wohnung",
    example_de: "Ich miete eine Wohnung in der Stadtmitte.",
    example_ru: "Я снимаю квартиру в центре города.",
    nounData: {
      gen_singular: "der Wohnung", dat_singular: "der Wohnung", akk_singular: "die Wohnung",
      gen_plural: "der Wohnungen", dat_plural: "den Wohnungen", akk_plural: "die Wohnungen"
    }
  }
};

const speak = (text: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "de-DE"; utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }
};

export default function WordDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const word = WORDS[id];

  if (!word) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Слово не найдено</p>
        <Link href="/vocabulary"><Button variant="outline" className="mt-4">← Назад</Button></Link>
      </div>
    );
  }

  const germanBase = word.german.replace(/^(der|die|das)\s/i, "");

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/vocabulary">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold flex-1">Карточка слова</h1>
        <Button variant="ghost" size="icon-sm">
          <Star className="w-4 h-4" />
        </Button>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          {word.article && (
            <span className={cn("text-2xl font-bold", getArticleColor(word.article))}>
              {word.article}
            </span>
          )}
          <span className="text-3xl font-bold">{germanBase}</span>
          <button
            onClick={() => speak(word.german)}
            className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors ml-1"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        {word.plural && (
          <p className="text-sm text-muted-foreground">Мн.ч: <span className="font-medium">{word.plural}</span></p>
        )}
        <div className="pt-1">
          <p className="text-xl font-semibold">{word.translation_ru}</p>
          {word.translation_en && (
            <p className="text-sm text-muted-foreground mt-0.5">{word.translation_en}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
          <Badge variant={word.cefr_level.toLowerCase() as "a1"|"a2"|"b1"|"b2"}>{word.cefr_level}</Badge>
          {word.topic && <Badge variant="muted">{word.topic}</Badge>}
          <Badge variant="outline" className="capitalize">{word.word_type}</Badge>
        </div>
      </div>

      {/* Example */}
      {word.example_de && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Пример</p>
          <div className="flex items-start gap-2">
            <p className="de-text text-base leading-relaxed flex-1">{word.example_de}</p>
            <button onClick={() => speak(word.example_de!)} className="text-muted-foreground hover:text-primary transition-colors mt-0.5 shrink-0">
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{word.example_ru}</p>
        </div>
      )}

      {/* Verb table */}
      {word.verbData && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Спряжение</p>
          <div className="grid grid-cols-2 gap-1.5 text-sm">
            {[
              ["ich", word.verbData.praesens_ich],
              ["du", word.verbData.praesens_du],
              ["er/sie/es", word.verbData.praesens_er],
            ].map(([pronoun, form]) => (
              <div key={pronoun} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground w-16 shrink-0">{pronoun}</span>
                <span className="font-medium de-text">{form}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-1.5 text-sm">
            {[
              ["Präteritum", word.verbData.praeteritum],
              ["Perfekt", word.verbData.perfekt],
              ["Partizip II", word.verbData.partizip_2],
              ["Hilfsverb", word.verbData.hilfsverb],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground w-24 shrink-0 text-xs">{label}</span>
                <span className="font-medium de-text">{value}</span>
              </div>
            ))}
          </div>
          {word.verbData.is_trennbar && (
            <p className="text-xs text-warning font-medium">⚡ Отделяемая приставка</p>
          )}
        </div>
      )}

      {/* Noun declension */}
      {word.nounData && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Склонение</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left pb-2 font-medium">Падеж</th>
                  <th className="text-left pb-2 font-medium">Ед.ч.</th>
                  <th className="text-left pb-2 font-medium">Мн.ч.</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {[
                  ["Nom.", word.german, word.plural ?? "—"],
                  ["Gen.", word.nounData.gen_singular ?? "—", word.nounData.gen_plural ?? "—"],
                  ["Dat.", word.nounData.dat_singular ?? "—", word.nounData.dat_plural ?? "—"],
                  ["Akk.", word.nounData.akk_singular ?? "—", word.nounData.akk_plural ?? "—"],
                ].map(([cas, sg, pl]) => (
                  <tr key={cas} className="border-t border-border/50">
                    <td className="py-1.5 text-muted-foreground text-xs pr-3">{cas}</td>
                    <td className="py-1.5 de-text pr-3">{sg}</td>
                    <td className="py-1.5 de-text text-muted-foreground">{pl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {word.notes && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Заметки</p>
          <p className="text-sm leading-relaxed">{word.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pb-2">
        <Button variant="outline" className="gap-2">
          <BookmarkPlus className="w-4 h-4" />
          В план повторения
        </Button>
        <Link href="/srs" className="block">
          <Button className="w-full gap-2">
            🃏 Учить сейчас
          </Button>
        </Link>
      </div>
    </div>
  );
}

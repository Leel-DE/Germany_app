"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TOPICS = ["Wohnung", "Arbeit", "Alltag", "Behörden", "Gesundheit", "Reisen", "Andere"];
const LEVELS = ["A1", "A2", "B1", "B2"];
const TYPES = [
  { value: "noun", label: "Существительное" },
  { value: "verb", label: "Глагол" },
  { value: "adjective", label: "Прилагательное" },
  { value: "adverb", label: "Наречие" },
  { value: "phrase", label: "Фраза" },
];

export default function AddWordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    german: "", article: "", plural: "", translation_ru: "", translation_en: "",
    word_type: "noun", cefr_level: "A2", topic: "Alltag", example_de: "", example_ru: "", notes: ""
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/vocabulary")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-bold">Добавить слово</h1>
      </div>

      {/* Word type */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Тип слова</p>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t.value} onClick={() => set("word_type", t.value)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
                form.word_type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* German */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Немецкое слово</p>
        {form.word_type === "noun" && (
          <div className="grid grid-cols-3 gap-2">
            {["der","die","das"].map(art => (
              <button key={art} onClick={() => set("article", art)}
                className={cn("py-2 rounded-xl border-2 text-sm font-bold transition-all",
                  form.article === art ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                  art === "der" && "hover:text-blue-600", art === "die" && "hover:text-red-500", art === "das" && "hover:text-green-600")}>
                {art}
              </button>
            ))}
          </div>
        )}
        <Input placeholder="z.B. Wohnung" value={form.german} onChange={e => set("german", e.target.value)} className="text-base" />
        {form.word_type === "noun" && (
          <Input placeholder="Plural: z.B. die Wohnungen" value={form.plural} onChange={e => set("plural", e.target.value)} />
        )}
      </div>

      {/* Translation */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Перевод</p>
        <Input placeholder="Перевод на русский *" value={form.translation_ru} onChange={e => set("translation_ru", e.target.value)} />
        <Input placeholder="English translation (необязательно)" value={form.translation_en} onChange={e => set("translation_en", e.target.value)} />
      </div>

      {/* Level & Topic */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Уровень и тема</p>
        <div className="flex gap-2">
          {LEVELS.map(l => (
            <button key={l} onClick={() => set("cefr_level", l)}
              className={cn("flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                form.cefr_level === l ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted text-muted-foreground")}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TOPICS.map(t => (
            <button key={t} onClick={() => set("topic", t)}
              className={cn("px-3 py-1.5 rounded-full text-xs border transition-all",
                form.topic === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Example */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Пример (необязательно)</p>
        <Input placeholder="Немецкий пример: Ich suche eine Wohnung." value={form.example_de} onChange={e => set("example_de", e.target.value)} className="italic" />
        <Input placeholder="Перевод примера: Я ищу квартиру." value={form.example_ru} onChange={e => set("example_ru", e.target.value)} />
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Заметки</p>
        <Textarea placeholder="Дополнительные заметки, связанные слова..." value={form.notes} onChange={e => set("notes", e.target.value)} className="min-h-[80px]" />
      </div>

      <Button
        className="w-full h-12 gap-2"
        disabled={!form.german || !form.translation_ru}
        onClick={() => { alert("В production: сохранение в Supabase. Пока demo."); router.push("/vocabulary"); }}
      >
        <Plus className="w-4 h-4" />
        Добавить слово
      </Button>
    </div>
  );
}

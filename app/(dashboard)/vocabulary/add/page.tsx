"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

const LEVELS = ["A1", "A2", "B1", "B2"];
const TYPES = ["noun", "verb", "adjective", "adverb", "phrase", "preposition", "conjunction"];

export default function AddWordPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("vocabulary");
  const [form, setForm] = useState({
    german: "",
    article: "",
    plural: "",
    translation_ru: "",
    word_type: "noun",
    cefr_level: "A2",
    topic: "Alltag",
    example_de: "",
    example_ru: "",
    notes: "",
  });

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("saveError"));
      setSaving(false);
      return;
    }
    router.push("/vocabulary");
    router.refresh();
  };

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/vocabulary")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold">{t("addWord")}</h1>
      </div>

      <Field label={t("german")}>
        <Input value={form.german} onChange={(e) => set("german", e.target.value)} placeholder="Wohnung" />
      </Field>

      <div className="grid grid-cols-3 gap-2">
        {["der", "die", "das"].map((article) => (
          <Button key={article} type="button" variant={form.article === article ? "default" : "outline"} onClick={() => set("article", article)}>
            {article}
          </Button>
        ))}
      </div>

      <Field label={t("plural")}>
        <Input value={form.plural} onChange={(e) => set("plural", e.target.value)} placeholder="die Wohnungen" />
      </Field>

      <Field label={t("translation")}>
        <Input value={form.translation_ru} onChange={(e) => set("translation_ru", e.target.value)} placeholder="квартира" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("type")}>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.word_type} onChange={(e) => set("word_type", e.target.value)}>
            {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </Field>
        <Field label={t("level")}>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.cefr_level} onChange={(e) => set("cefr_level", e.target.value)}>
            {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t("topic")}>
        <Input value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="Alltag" />
      </Field>

      <Field label={t("exampleDe")}>
        <Input value={form.example_de} onChange={(e) => set("example_de", e.target.value)} placeholder="Ich suche eine Wohnung." />
      </Field>

      <Field label={t("exampleTranslation")}>
        <Input value={form.example_ru} onChange={(e) => set("example_ru", e.target.value)} placeholder="Я ищу квартиру." />
      </Field>

      <Field label={t("notes")}>
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="min-h-[90px]" />
      </Field>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Button className="h-12 w-full gap-2" disabled={!form.german || !form.translation_ru || saving} onClick={save}>
        <Plus className="h-4 w-4" />
        {saving ? t("saving") : t("saveToDb")}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

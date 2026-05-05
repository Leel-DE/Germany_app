"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type Question = {
  id: string;
  order: number;
  key: string;
  question_ru: string;
  description_ru?: string;
  type: "multi_select" | "single_select" | "slider";
  options?: { value: string; label_ru: string; emoji?: string }[];
  min?: number;
  max?: number;
  step?: number;
};

type AnswerValue = string | number | string[];

export default function OnboardingPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tErrors = useTranslations("errors");
  const tOnboarding = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const loadOnboardingError = tErrors("couldNotLoadOnboarding");

  useEffect(() => {
    fetch("/api/onboarding/questions", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions ?? []))
      .catch(() => setError(loadOnboardingError))
      .finally(() => setLoading(false));
  }, [loadOnboardingError]);

  const question = questions[index];
  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;
  const canContinue = useMemo(() => {
    if (!question) return false;
    const value = answers[question.key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== "";
  }, [answers, question]);

  const setAnswer = (key: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/onboarding/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? tErrors("couldNotSaveOnboarding"));
      setSaving(false);
      return;
    }
    router.replace("/onboarding/placement-test");
    router.refresh();
  };

  if (loading) {
    return <Centered><Loader2 className="h-6 w-6 animate-spin" /></Centered>;
  }

  if (!question) {
    return <Centered>{tErrors("onboardingUnavailable")}</Centered>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{tOnboarding("stepOf", { current: index + 1, total: questions.length })}</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{question.question_ru}</h1>
            {question.description_ru && <p className="mt-1 text-sm text-muted-foreground">{question.description_ru}</p>}
          </div>

          {question.type === "slider" ? (
            <div className="space-y-3">
              <input
                type="range"
                min={question.min}
                max={question.max}
                step={question.step}
                value={Number(answers[question.key] ?? question.min ?? 1)}
                onChange={(event) => setAnswer(question.key, Number(event.target.value))}
                className="w-full"
              />
              <p className="text-center text-3xl font-bold">{String(answers[question.key] ?? question.min)}</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {(question.options ?? []).map((option) => {
                const value = answers[question.key];
                const selected = Array.isArray(value) ? value.includes(option.value) : value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (question.type === "multi_select") {
                        const current = Array.isArray(value) ? value : [];
                        setAnswer(
                          question.key,
                          selected ? current.filter((item) => item !== option.value) : [...current, option.value]
                        );
                      } else {
                        setAnswer(question.key, option.value);
                      }
                    }}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label_ru}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" disabled={index === 0 || saving} onClick={() => setIndex((prev) => prev - 1)}>
            {tOnboarding("back")}
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={!canContinue || saving}
            onClick={() => (index === questions.length - 1 ? submit() : setIndex((prev) => prev + 1))}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : index === questions.length - 1 ? tOnboarding("saveProfile") : tCommon("continue")}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">{children}</main>;
}

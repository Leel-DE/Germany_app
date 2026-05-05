"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GrammarTopic } from "@/types";
import { useTranslations } from "next-intl";

export default function GrammarLessonPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [lesson, setLesson] = useState<GrammarTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const t = useTranslations("grammar");

  useEffect(() => {
    fetch(`/api/grammar-lessons/${params.slug}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setLesson(data.lesson ?? null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" /></State>;
  if (!lesson) return <State>{t("lessonNotFound")}</State>;

  const correct = lesson.mini_test.filter((q, i) => answers[i] === q.answer).length;
  const allAnswered = lesson.mini_test.length > 0 && Object.keys(answers).length === lesson.mini_test.length;
  const score = lesson.mini_test.length ? Math.round((correct / lesson.mini_test.length) * 100) : 100;

  const finish = async () => {
    await fetch(`/api/grammar-lessons/${lesson.slug}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
    setCompleted(true);
    router.refresh();
  };

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/grammar")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">{lesson.title_de}</h1>
          <p className="text-xs text-muted-foreground">{lesson.cefr_level} · {lesson.title_ru}</p>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{t("explanation")}</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{lesson.content_json.explanation}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("rules")}</h2>
        {lesson.content_json.rules.map((rule) => (
          <div key={rule.rule} className="rounded-lg border border-border bg-card p-4">
            <p className="font-medium">{rule.rule}</p>
            <p className="mt-1 text-sm de-text">{rule.example_de}</p>
            <p className="text-xs text-muted-foreground">{rule.example_ru}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("miniTest")}</h2>
        {lesson.mini_test.map((question, i) => (
          <div key={`${question.question}-${i}`} className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-sm font-medium">{question.question}</p>
            <div className="grid gap-2">
              {question.options.map((option, optionIndex) => (
                <button
                  key={option}
                  onClick={() => setAnswers((prev) => ({ ...prev, [i]: optionIndex }))}
                  className={`rounded-lg border p-2 text-left text-sm ${
                    answers[i] === optionIndex ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {completed ? (
        <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {t("savedScore", { score })}
        </div>
      ) : (
        <Button className="w-full" disabled={!allAnswered} onClick={finish}>
          {t("completeLesson")} · {score}%
        </Button>
      )}
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[50vh] place-items-center text-muted-foreground">{children}</div>;
}

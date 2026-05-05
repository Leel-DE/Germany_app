"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MiniTestQuestion, ReadingProgress } from "@/types";

type CheckedAnswer = {
  questionIndex: number;
  selected?: number;
  correct: boolean;
  answer: number;
};

export function ReadingQuiz({
  textId,
  questions,
}: {
  textId: string;
  questions: MiniTestQuestion[];
}) {
  const validQuestions = useMemo(() => normalizeQuestions(questions), [questions]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [checked, setChecked] = useState<CheckedAnswer[]>([]);
  const [startedAt] = useState(() => new Date().toISOString());
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingProgress(true);
    setError("");

    fetch(`/api/reading/texts/${textId}/progress`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "Could not load reading progress.");
        return data as { progress?: ReadingProgress | null };
      })
      .then((data) => {
        if (cancelled) return;
        setProgress(data.progress ?? null);
        if (data.progress?.answers) {
          setAnswers(data.progress.answers);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load reading progress.");
      })
      .finally(() => {
        if (!cancelled) setLoadingProgress(false);
      });

    return () => {
      cancelled = true;
    };
  }, [textId]);

  if (validQuestions.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        No quiz questions are configured for this text yet.
      </section>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === validQuestions.length;
  const score = progress?.score ?? null;

  const submit = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/reading/texts/${textId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, startedAt }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not save reading progress.");
      setProgress(data.progress ?? null);
      setChecked(Array.isArray(data.checked) ? data.checked : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save reading progress.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setChecked([]);
    setProgress(null);
    setError("");
  };

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">Comprehension quiz</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {answeredCount} of {validQuestions.length} answered
          </p>
        </div>
        {score !== null && (
          <div className={cn(
            "rounded-full px-3 py-1.5 text-sm font-bold",
            score >= 80 ? "bg-success/10 text-success" : score >= 60 ? "bg-warning/10 text-warning" : "bg-again/10 text-again"
          )}>
            {score}%
          </div>
        )}
      </div>

      {loadingProgress && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading saved progress...
        </div>
      )}

      {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="space-y-3">
        {validQuestions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const checkedAnswer = checked.find((item) => item.questionIndex === questionIndex);
          const savedAndChecked = !!checkedAnswer;

          return (
            <div key={`${question.question}-${questionIndex}`} className="rounded-lg border border-border bg-background/30 p-3">
              <p className="text-sm font-medium">{questionIndex + 1}. {question.question}</p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrect = savedAndChecked && checkedAnswer.answer === optionIndex;
                  const isWrongSelection = savedAndChecked && isSelected && !checkedAnswer.correct;

                  return (
                    <button
                      key={`${option}-${optionIndex}`}
                      type="button"
                      onClick={() => {
                        if (savedAndChecked) return;
                        setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                        !savedAndChecked && isSelected && "border-primary bg-primary/10 text-primary",
                        !savedAndChecked && !isSelected && "border-border hover:bg-muted",
                        isCorrect && "border-success bg-success/10 text-success",
                        isWrongSelection && "border-again bg-again/10 text-again",
                        savedAndChecked && !isCorrect && !isWrongSelection && "border-border text-muted-foreground"
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {savedAndChecked && question.explanation && (
                <div className={cn(
                  "mt-3 flex gap-2 rounded-lg p-3 text-xs",
                  checkedAnswer.correct ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {checkedAnswer.correct ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {checked.length > 0 ? (
        <Button variant="outline" className="w-full" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      ) : (
        <Button className="w-full" disabled={!allAnswered || saving} onClick={submit}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Save progress
        </Button>
      )}
    </section>
  );
}

function normalizeQuestions(questions: MiniTestQuestion[]) {
  return questions.filter((question) => (
    typeof question.question === "string" &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    Number.isInteger(question.answer) &&
    question.answer >= 0 &&
    question.answer < question.options.length
  ));
}

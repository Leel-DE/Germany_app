"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Question = {
  id: string;
  order: number;
  question_de: string;
  question_ru: string;
  options: string[];
  cefr_level: string;
  area: string;
};

export default function PlacementTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ score: number; detectedLevel: string; weakAreas: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/placement-test", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const question = questions[index];
  const selected = question ? answers[question.id] : undefined;
  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;

  const submit = async () => {
    setSaving(true);
    const res = await fetch("/api/placement-test/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, selected]) => ({ questionId, selected })),
      }),
    });
    const data = await res.json();
    setResult(data);
    setSaving(false);
  };

  if (loading) return <Centered><Loader2 className="h-6 w-6 animate-spin" /></Centered>;

  if (result) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-xl space-y-5 text-center">
          <h1 className="text-3xl font-bold">Your starting level is {result.detectedLevel}</h1>
          <p className="text-muted-foreground">Score: {result.score}%. Weak areas: {result.weakAreas.join(", ") || "none detected"}.</p>
          <Button className="w-full" onClick={() => { router.replace("/home"); router.refresh(); }}>
            Open dashboard
          </Button>
        </div>
      </main>
    );
  }

  if (!question) return <Centered>Placement test is not available.</Centered>;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {index + 1} of {questions.length}</span>
            <span>{question.cefr_level} · {question.area}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{question.question_ru}</p>
            <h1 className="mt-2 text-2xl font-bold">{question.question_de}</h1>
          </div>
          <div className="grid gap-2">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                className={`rounded-lg border p-3 text-left transition ${
                  selected === optionIndex ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Button variant="outline" disabled={index === 0 || saving} onClick={() => setIndex((prev) => prev - 1)}>Back</Button>
          <Button
            className="flex-1"
            disabled={selected === undefined || saving}
            onClick={() => (index === questions.length - 1 ? submit() : setIndex((prev) => prev + 1))}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : index === questions.length - 1 ? "Finish test" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">{children}</main>;
}

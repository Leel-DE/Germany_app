"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReviewItem = {
  question: {
    id: string;
    type: string;
    question: string;
    options: string[];
    correctAnswer: unknown;
    explanation: string;
    topic: string;
    skill: string;
    level: string;
  };
  userAnswer: unknown;
  correct: boolean;
};

export default function TestReviewPage() {
  const params = useParams<{ testId: string; attemptId: string }>();
  const router = useRouter();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/tests/${params.testId}/review/${params.attemptId}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Could not load review");
        if (alive) setItems(body.review ?? []);
      })
      .catch((err) => alive && setError(err instanceof Error ? err.message : "Could not load review"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [params.attemptId, params.testId]);

  if (loading) return <State icon={Loader2} title="Loading review" spin />;
  if (error) return <State icon={AlertCircle} title="Review unavailable" text={error} />;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/tests/${params.testId}`)} aria-label="Back to test"><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Review mistakes</h1>
          <p className="text-sm text-muted-foreground">{items.filter((item) => !item.correct).length} mistakes · {items.length} questions</p>
        </div>
      </div>

      <section className="space-y-3">
        {items.map((item, index) => (
          <article key={item.question.id} className={cn("rounded-lg border bg-card p-4", item.correct ? "border-border" : "border-destructive/30")}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {item.correct ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
              <span className="text-sm font-medium">Question {index + 1}</span>
              <Badge variant="outline">{item.question.topic}</Badge>
              <Badge variant="muted">{item.question.skill}</Badge>
            </div>
            <h2 className="font-semibold leading-7">{item.question.question}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <AnswerBox label="User answer" value={formatAnswer(item.userAnswer, item.question.options)} muted={!item.correct} />
              <AnswerBox label="Correct answer" value={formatAnswer(item.question.correctAnswer, item.question.options)} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.question.explanation}</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href={`/focused-practice/start?topic=${encodeURIComponent(item.question.topic)}`}>Practice this topic</Link>
            </Button>
          </article>
        ))}
      </section>
    </main>
  );
}

function AnswerBox({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-medium", muted && "text-destructive")}>{value || "—"}</p>
    </div>
  );
}

function State({ icon: Icon, title, text, spin }: { icon: typeof AlertCircle; title: string; text?: string; spin?: boolean }) {
  return <div className="grid min-h-[50vh] place-items-center text-center"><div><Icon className={cn("mx-auto h-7 w-7 text-muted-foreground", spin && "animate-spin")} /><h1 className="mt-3 font-semibold">{title}</h1>{text ? <p className="mt-1 text-sm text-muted-foreground">{text}</p> : null}</div></div>;
}

function formatAnswer(value: unknown, options: string[]) {
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "number") return options[value] ?? String(value);
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value ?? "");
}

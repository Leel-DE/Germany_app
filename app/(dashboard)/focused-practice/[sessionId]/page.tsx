"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Home, Loader2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PracticeTask {
  id: string;
  taskType: "multiple_choice" | "fill_blank" | "translate" | "sentence_order";
  question: string;
  options: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number | null;
  explanation: string;
  sourceType: string;
  sourceId?: string;
}

interface PracticeSession {
  id: string;
  topic: string;
  type: "grammar" | "vocabulary" | "reading" | "mixed";
  status: "in_progress" | "completed";
  score: number | null;
  mistakes: string[];
  tasks: PracticeTask[];
}

export default function FocusedPracticePage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [current, setCurrent] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/focused-practice/${params.sessionId}`, { cache: "no-store" });
        const data = await parseJson(res);
        if (alive) {
          setSession(data.session);
          setAnswers(Object.fromEntries(
            (data.session.tasks as PracticeTask[])
              .filter((task) => task.userAnswer != null)
              .map((task) => [task.id, task.userAnswer as string | number])
          ));
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not load focused practice.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.sessionId]);

  const task = session?.tasks[current] ?? null;
  const progress = session?.tasks.length ? Math.round(((current + (showFeedback ? 1 : 0)) / session.tasks.length) * 100) : 0;
  const selected = task ? answers[task.id] : undefined;
  const isCorrect = useMemo(() => {
    if (!task || !showFeedback) return null;
    return sameAnswer(selected, task.correctAnswer);
  }, [selected, showFeedback, task]);

  async function completeSession() {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/focused-practice/${session.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await parseJson(res);
      setSession(data.session);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save practice result.");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (!session) return;
    if (current >= session.tasks.length - 1) {
      void completeSession();
      return;
    }
    setCurrent((value) => value + 1);
    setShowFeedback(false);
  }

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" /></State>;
  if (error) return <State>{error}</State>;
  if (!session) return <State>Focused practice session not found.</State>;
  if (session.status === "completed") return <PracticeResult session={session} />;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Focused practice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {titleCase(session.topic)} - {session.type}
          </p>
        </div>
        <Badge variant="outline">{current + 1} / {session.tasks.length}</Badge>
      </div>

      <Progress value={progress} className="h-2.5" />

      {task ? (
        <PracticeTaskCard
          task={task}
          answer={selected}
          feedback={showFeedback}
          isCorrect={isCorrect}
          onAnswer={(value) => setAnswers((prev) => ({ ...prev, [task.id]: value }))}
        />
      ) : null}

      {showFeedback && task ? (
        <div className={`rounded-lg border p-4 text-sm ${isCorrect ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          <div className="flex items-start gap-2">
            {isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
            <div>
              <p className="font-medium">{isCorrect ? "Correct" : "Review this"}</p>
              <p className="mt-1">{task.explanation}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        {!showFeedback ? (
          <Button className="h-12 flex-1" disabled={selected == null || selected === ""} onClick={() => setShowFeedback(true)}>
            Check answer
          </Button>
        ) : (
          <Button className="h-12 flex-1" disabled={saving} onClick={next}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {current >= session.tasks.length - 1 ? "Finish practice" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  );
}

function PracticeTaskCard({
  task,
  answer,
  feedback,
  isCorrect,
  onAnswer,
}: {
  task: PracticeTask;
  answer: string | number | undefined;
  feedback: boolean;
  isCorrect: boolean | null;
  onAnswer: (value: string | number) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="muted">{task.taskType.replace(/_/g, " ")}</Badge>
        <Badge variant="outline">{task.sourceType}</Badge>
      </div>
      <h2 className="text-lg font-semibold leading-7">{task.question}</h2>
      {task.options.length ? (
        <div className="mt-5 grid gap-2">
          {task.options.map((option, index) => {
            const active = answer === index;
            const correct = feedback && sameAnswer(index, task.correctAnswer);
            const wrong = feedback && active && !isCorrect;
            return (
              <Button
                key={`${option}-${index}`}
                variant={active ? "secondary" : "outline"}
                className={`h-auto justify-start whitespace-normal py-3 text-left ${correct ? "border-success text-success" : ""} ${wrong ? "border-destructive text-destructive" : ""}`}
                disabled={feedback}
                onClick={() => onAnswer(index)}
              >
                {option}
              </Button>
            );
          })}
        </div>
      ) : (
        <Input
          className="mt-5"
          value={String(answer ?? "")}
          disabled={feedback}
          placeholder="Type your answer"
          onChange={(event) => onAnswer(event.target.value)}
        />
      )}
    </section>
  );
}

function PracticeResult({ session }: { session: PracticeSession }) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 pb-6">
      <section className="rounded-lg border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-3 text-3xl font-bold">Practice completed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Score: {session.score ?? 0}% - {session.tasks.length - session.mistakes.length}/{session.tasks.length} correct
        </p>
      </section>

      {session.mistakes.length ? (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold">Mistakes to review</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {session.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild className="h-12">
          <Link href="/home"><Home className="h-4 w-4" />Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/home"><RotateCcw className="h-4 w-4" />Review recommendations</Link>
        </Button>
      </div>
    </main>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[50vh] place-items-center text-muted-foreground">{children}</div>;
}

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data;
}

function sameAnswer(userAnswer: string | number | undefined, correctAnswer: string | number | undefined) {
  if (correctAnswer == null) return false;
  if (typeof correctAnswer === "number") return Number(userAnswer) === correctAnswer;
  return String(userAnswer ?? "").trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

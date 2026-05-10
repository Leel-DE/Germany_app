"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Loader2, RotateCcw, Send, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CEFRLevel } from "@/types";

type TestAnswer = number | boolean | string | string[];
type Question = {
  id: string;
  order: number;
  type: "multiple_choice" | "true_false" | "fill_blank" | "sentence_order";
  question: string;
  options: string[];
  level: CEFRLevel;
  skill: string;
  topic: string;
};
type Test = {
  id: string;
  title: string;
  level: CEFRLevel;
  skill: string;
  type: "placement" | "practice" | "exam";
  timeLimit: number | null;
  questionsCount: number;
  description: string;
};
type Attempt = {
  id: string;
  answers: Record<string, TestAnswer>;
  score: number | null;
  correct: number | null;
  total: number;
  estimatedLevel: CEFRLevel | null;
  weakAreas: string[];
  strongAreas: string[];
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt: string | null;
  timeSpent: number | null;
};

export default function TestRunnerPage() {
  const params = useParams<{ testId: string }>();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const question = questions[index];
  const answer = question && attempt ? attempt.answers[question.id] : undefined;
  const answeredCount = attempt ? Object.keys(attempt.answers).length : 0;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const elapsed = attempt ? Math.max(0, Math.floor((now - new Date(attempt.startedAt).getTime()) / 1000)) : 0;
  const remaining = test?.timeLimit && attempt?.status === "in_progress" ? Math.max(0, test.timeLimit * 60 - elapsed) : null;

  const start = useCallback(async (retry = false) => {
    const res = await fetch(`/api/tests/${params.testId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retry }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error ?? "Could not start test");
    return body.attempt as Attempt;
  }, [params.testId]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const testRes = await fetch(`/api/tests/${params.testId}`, { cache: "no-store" });
        const testBody = await testRes.json().catch(() => null);
        if (!testRes.ok) throw new Error(testBody?.error ?? "Test not found");
        const nextAttempt = await start(false);
        if (!alive) return;
        setTest(testBody.test);
        setQuestions(testBody.questions ?? []);
        setAttempt(nextAttempt);
        const firstUnanswered = (testBody.questions ?? []).findIndex((item: Question) => nextAttempt.answers[item.id] === undefined);
        setIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Test could not be loaded");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.testId, start]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0 && attempt?.status === "in_progress") void finish();
  }, [remaining, attempt?.status]);

  async function saveAnswer(questionId: string, value: TestAnswer) {
    if (!attempt) return;
    setSaving(true);
    setError(null);
    setAttempt((prev) => prev ? { ...prev, answers: { ...prev.answers, [questionId]: value } } : prev);
    try {
      const res = await fetch(`/api/tests/${params.testId}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, questionId, answer: value }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Answer was not saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Answer was not saved");
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (!attempt) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tests/${params.testId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Could not complete test");
      setAttempt(body.attempt);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete test");
    } finally {
      setSaving(false);
    }
  }

  async function retry() {
    setLoading(true);
    try {
      const next = await start(true);
      setAttempt(next);
      setIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restart test");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <State icon={Loader2} title="Loading test" spin />;
  if (error && !test) return <State icon={AlertCircle} title="Test unavailable" text={error} />;
  if (!test || !attempt || !question) return <State icon={AlertCircle} title="Test unavailable" text="No questions found." />;

  if (attempt.status === "completed") {
    return <ResultView test={test} attempt={attempt} onRetry={retry} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/tests")} aria-label="Back to tests"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight">{test.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={test.level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{test.level}</Badge>
            <Badge variant="muted">{test.skill}</Badge>
            <Badge variant="outline">{test.type}</Badge>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null}

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-medium">Question {index + 1} / {questions.length}</span>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{answeredCount} answered</span>
            {remaining !== null ? <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{formatTime(remaining)}</span> : null}
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge variant="outline">{question.topic}</Badge>
          <Badge variant="muted">{question.type.replaceAll("_", " ")}</Badge>
        </div>
        <h2 className="text-lg font-semibold leading-7">{question.question}</h2>
        <AnswerUI question={question} value={answer} onChange={(value) => saveAnswer(question.id, value)} />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((prev) => Math.max(0, prev - 1))}>Previous</Button>
        <div className="flex gap-2">
          {index < questions.length - 1 ? (
            <Button onClick={() => setIndex((prev) => Math.min(questions.length - 1, prev + 1))}>Next</Button>
          ) : null}
          <Button variant={answeredCount === questions.length ? "default" : "outline"} onClick={finish} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Finish
          </Button>
        </div>
      </div>
    </main>
  );
}

function AnswerUI({ question, value, onChange }: { question: Question; value: TestAnswer | undefined; onChange: (value: TestAnswer) => void }) {
  if (question.type === "fill_blank") {
    return <Input className="mt-4" value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} placeholder="Type your answer" />;
  }
  if (question.type === "sentence_order") {
    const current = Array.isArray(value) ? value : [];
    return (
      <div className="mt-4 space-y-3">
        <div className="min-h-12 rounded-lg border border-border bg-background p-2 text-sm">{current.length ? current.join(" ") : "Tap words in order"}</div>
        <div className="flex flex-wrap gap-2">
          {question.options.map((option, idx) => (
            <Button key={`${option}-${idx}`} variant={current.includes(option) ? "secondary" : "outline"} size="sm" onClick={() => onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option])}>{option}</Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => onChange([])}>Clear</Button>
        </div>
      </div>
    );
  }
  const options = question.type === "true_false" ? ["True", "False"] : question.options;
  return (
    <div className="mt-4 grid gap-2">
      {options.map((option, idx) => {
        const answerValue = question.type === "true_false" ? idx === 0 : idx;
        const active = value === answerValue;
        return (
          <Button key={option} variant={active ? "secondary" : "outline"} className="h-auto justify-start whitespace-normal py-3 text-left" onClick={() => onChange(answerValue)}>
            {option}
          </Button>
        );
      })}
    </div>
  );
}

function ResultView({ test, attempt, onRetry }: { test: Test; attempt: Attempt; onRetry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{test.title}</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-5xl font-bold text-primary">{attempt.score}</span>
          <span className="pb-2 text-sm text-muted-foreground">/100</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Correct" value={`${attempt.correct}/${attempt.total}`} />
          <Metric label="Time" value={formatTime(attempt.timeSpent ?? 0)} />
          <Metric label="Level" value={attempt.estimatedLevel ?? test.level} />
          <Metric label="Status" value={placementBand(attempt.score ?? 0)} />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <AreaPanel title="Strong areas" areas={attempt.strongAreas} />
        <AreaPanel title="Weak areas" areas={attempt.weakAreas} />
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <Button asChild><Link href={`/focused-practice/start?topic=${encodeURIComponent(attempt.weakAreas[0] ?? "akkusativ")}`}>Practice weak areas</Link></Button>
        <Button asChild variant="outline"><Link href={`/tests/${test.id}/review/${attempt.id}`}>Review mistakes</Link></Button>
        <Button variant="outline" onClick={onRetry}><RotateCcw className="h-4 w-4" />Retry test</Button>
        <Button asChild variant="outline"><Link href="/home">Back to dashboard</Link></Button>
      </div>
    </main>
  );
}

function AreaPanel({ title, areas }: { title: string; areas: string[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">{areas.length ? areas.map((area) => <Badge key={area} variant="muted">{area}</Badge>) : <span className="text-sm text-muted-foreground">No data yet</span>}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function State({ icon: Icon, title, text, spin }: { icon: typeof AlertCircle; title: string; text?: string; spin?: boolean }) {
  return <div className="grid min-h-[50vh] place-items-center text-center"><div><Icon className={cn("mx-auto h-7 w-7 text-muted-foreground", spin && "animate-spin")} /><h1 className="mt-3 font-semibold">{title}</h1>{text ? <p className="mt-1 text-sm text-muted-foreground">{text}</p> : null}</div></div>;
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function placementBand(score: number) {
  if (score < 40) return "below";
  if (score < 60) return "weak";
  if (score < 75) return "current";
  if (score < 90) return "confident";
  return "next ready";
}

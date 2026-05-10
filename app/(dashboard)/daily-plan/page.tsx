"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Home,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { MiniTestQuestion, PlanStepStatus, PlanStepType, SRSRating } from "@/types";

type DailyPlan = {
  id: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  steps: PlanTask[];
  estimated_minutes: number;
  steps_completed: number;
  steps_total: number;
  progress_percent: number;
  active_task_id: string | null;
};

type PlanTask = {
  id: string;
  type: PlanStepType;
  label: string;
  estimatedMinutes: number;
  status: PlanStepStatus;
  order: number;
  payload: Record<string, unknown>;
  topicSlug?: string;
  textId?: string;
  templateId?: string;
  wordIds?: string[];
  result?: {
    accuracy?: number;
    wordsLearned?: number;
    wordsReviewed?: number;
  } | null;
};

type WordDTO = {
  id: string;
  german: string;
  translation_ru: string;
  article?: string;
  plural?: string;
  example_de?: string;
  example_ru?: string;
  word_type: string;
};

type LessonDTO = {
  title_de: string;
  title_ru: string;
  content_json: {
    explanation: string;
    rules: { rule: string; example_de: string; example_ru: string }[];
  };
  mini_test: MiniTestQuestion[];
};

type ReadingDTO = {
  title: string;
  content: string;
  topic: string;
  questions: MiniTestQuestion[];
};

type WritingDTO = {
  id: string;
  title: string;
  prompt: string;
  minWords: number;
  estimatedMinutes: number;
};

type TestDTO = {
  id: string;
  title: string;
  level: string;
  skill: string;
  type: string;
  questionsCount: number;
  timeLimit: number | null;
};

type MixedQuestion = {
  id: string;
  question: string;
  prompt_ru: string;
  options: string[];
  area: string;
};

type Result = {
  completed: boolean;
  tasks_completed: number;
  total_tasks: number;
  accuracy: number;
  words_learned: number;
  weak_areas: string[];
  time_spent: number;
  streak: number;
};

const RATINGS: { rating: SRSRating; label: string }[] = [
  { rating: "again", label: "Again" },
  { rating: "hard", label: "Hard" },
  { rating: "good", label: "Good" },
  { rating: "easy", label: "Easy" },
];

export default function DailyPlanPage() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResult = useCallback(async () => {
    const res = await fetch("/api/daily-plan/result", { cache: "no-store" });
    const data = await parseJson(res);
    setResult(data.result);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-plan/today", { cache: "no-store" });
      const data = await parseJson(res);
      setPlan(data.plan);
      if (data.plan?.status === "completed") await loadResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load daily plan.");
    } finally {
      setLoading(false);
    }
  }, [loadResult]);

  useEffect(() => {
    void load();
  }, [load]);

  async function startPlan() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-plan/start", { method: "POST" });
      const data = await parseJson(res);
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start daily plan.");
    } finally {
      setSaving(false);
    }
  }

  async function completeTask(task: PlanTask, payload: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily-plan/tasks/${task.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseJson(res);
      setPlan(data.plan);
      if (data.plan?.status === "completed") await loadResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete task.");
    } finally {
      setSaving(false);
    }
  }

  const activeTask = useMemo(() => {
    if (!plan) return null;
    return plan.steps.find((task) => task.status !== "completed") ?? null;
  }, [plan]);

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" /></State>;
  if (!plan) return <State>Daily plan is not available.</State>;
  if (plan.status === "completed") return <ResultScreen result={result} />;

  const activeIndex = activeTask ? plan.steps.findIndex((task) => task.id === activeTask.id) : 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Today's plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.steps_completed}/{plan.steps_total} completed - {plan.estimated_minutes} min
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/home">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <TaskProgressBar plan={plan} />
      {error ? <ErrorBanner message={error} /> : null}

      {plan.status === "pending" ? (
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Ready to start</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You will complete each task in order. Progress is saved after every task.
          </p>
          <Button className="mt-5 h-12 w-full" onClick={startPlan} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Start today's plan
          </Button>
        </section>
      ) : activeTask ? (
        <TaskContainer
          task={activeTask}
          index={activeIndex}
          total={plan.steps_total}
          saving={saving}
          onComplete={(payload) => completeTask(activeTask, payload)}
        />
      ) : null}
    </main>
  );
}

function TaskProgressBar({ plan }: { plan: DailyPlan }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Daily flow</span>
        <span className="text-muted-foreground">{plan.progress_percent}%</span>
      </div>
      <Progress value={plan.progress_percent} className="h-2.5" />
      <div className="mt-3 grid grid-cols-6 gap-2">
        {plan.steps.map((task) => (
          <div key={task.id} className="flex items-center gap-1 text-xs text-muted-foreground">
            {task.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Circle className="h-3.5 w-3.5" />}
            <span className="hidden truncate sm:block">{taskLabel(task.type)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaskContainer({
  task,
  index,
  total,
  saving,
  onComplete,
}: {
  task: PlanTask;
  index: number;
  total: number;
  saving: boolean;
  onComplete: (payload: Record<string, unknown>) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <TaskHeader task={task} index={index} total={total} />
      <div className="border-t border-border p-4">
        {task.type === "vocabulary_review" ? <VocabularyReviewTask task={task} saving={saving} onComplete={onComplete} /> : null}
        {task.type === "new_words" ? <NewWordsTask task={task} saving={saving} onComplete={onComplete} /> : null}
        {task.type === "grammar" ? <GrammarTask task={task} saving={saving} onComplete={onComplete} /> : null}
        {task.type === "reading" ? <ReadingTask task={task} saving={saving} onComplete={onComplete} /> : null}
        {task.type === "writing" ? <WritingTask task={task} saving={saving} onComplete={onComplete} /> : null}
        {task.type === "test" ? <MixedTestTask task={task} saving={saving} onComplete={onComplete} /> : null}
      </div>
    </section>
  );
}

function TaskHeader({ task, index, total }: { task: PlanTask; index: number; total: number }) {
  return (
    <div className="flex items-start justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-medium text-primary">Task {index + 1} of {total}</p>
        <h2 className="mt-1 text-xl font-bold">{task.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{taskLabel(task.type)} - {task.estimatedMinutes} min</p>
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{task.status}</span>
    </div>
  );
}

function VocabularyReviewTask({ task, saving, onComplete }: TaskProps) {
  const words = getWords(task);
  const [index, setIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, SRSRating>>({});
  const current = words[index];
  const completed = words.length === 0 || Object.keys(ratings).length >= words.length;

  function rate(rating: SRSRating) {
    if (!current) return;
    setRatings((prev) => ({ ...prev, [current.id]: rating }));
    setIndex((value) => Math.min(words.length - 1, value + 1));
  }

  if (!current) {
    return <TaskFooter saving={saving} disabled={false} onComplete={() => onComplete({ ratings: {} })} label="No reviews due. Continue" />;
  }

  return (
    <div className="space-y-4">
      <CardWord word={current} current={index + 1} total={words.length} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RATINGS.map((item) => (
          <Button key={item.rating} variant="outline" onClick={() => rate(item.rating)} disabled={Boolean(ratings[current.id])}>
            {item.label}
          </Button>
        ))}
      </div>
      <TaskFooter saving={saving} disabled={!completed} onComplete={() => onComplete({ ratings })} />
    </div>
  );
}

function NewWordsTask({ task, saving, onComplete }: TaskProps) {
  const words = getWords(task);
  const [index, setIndex] = useState(0);
  const current = words[index];
  const finished = words.length === 0 || index >= words.length - 1;

  if (!current) return <TaskFooter saving={saving} disabled={false} onComplete={() => onComplete({ learnedWordIds: [] })} />;

  return (
    <div className="space-y-4">
      <CardWord word={current} current={index + 1} total={words.length} />
      {finished ? (
        <TaskFooter saving={saving} disabled={false} onComplete={() => onComplete({ learnedWordIds: words.map((word) => word.id) })} label="Mark words learned" />
      ) : (
        <Button className="w-full" onClick={() => setIndex((value) => value + 1)}>
          Next word
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function GrammarTask({ task, saving, onComplete }: TaskProps) {
  const lesson = getPayload<LessonDTO>(task, "lesson");
  const questions = lesson?.mini_test ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answered = Object.keys(answers).length >= questions.length;

  if (!lesson) return <MissingTaskData saving={saving} onComplete={onComplete} />;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold">{lesson.title_de}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.content_json.explanation}</p>
      </div>
      <div className="space-y-2">
        {lesson.content_json.rules.slice(0, 3).map((rule) => (
          <div key={rule.rule} className="rounded-lg border border-border bg-background p-3 text-sm">
            <p className="font-medium">{rule.rule}</p>
            <p className="mt-1 text-muted-foreground">{rule.example_de}</p>
          </div>
        ))}
      </div>
      <QuestionList questions={questions} answers={answers} setAnswers={setAnswers} />
      <TaskFooter saving={saving} disabled={!answered} onComplete={() => onComplete({ score: scoreQuestions(questions, answers) })} />
    </div>
  );
}

function ReadingTask({ task, saving, onComplete }: TaskProps) {
  const text = getPayload<ReadingDTO>(task, "text");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [read, setRead] = useState(false);
  const answered = text ? Object.keys(answers).length >= text.questions.length : false;

  if (!text) return <MissingTaskData saving={saving} onComplete={onComplete} />;

  return (
    <div className="space-y-5">
      <article className="rounded-lg border border-border bg-background p-4">
        <h3 className="font-semibold">{text.title}</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{text.content}</p>
      </article>
      <Button variant={read ? "secondary" : "outline"} onClick={() => setRead(true)}>
        {read ? "Read confirmed" : "I have read this text"}
      </Button>
      <QuestionList questions={text.questions} answers={answers} setAnswers={setAnswers} />
      <TaskFooter saving={saving} disabled={!read || !answered} onComplete={() => onComplete({ answers })} />
    </div>
  );
}

function WritingTask({ task, saving, onComplete }: TaskProps) {
  const writing = getPayload<WritingDTO>(task, "task");

  if (!writing) return <MissingTaskData saving={saving} onComplete={onComplete} />;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-4">
        <h3 className="font-semibold">{writing.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{writing.prompt}</p>
        <p className="mt-3 text-xs text-muted-foreground">Minimum {writing.minWords} words · {writing.estimatedMinutes} min</p>
      </div>
      <Button asChild className="w-full">
        <Link href={`/writing/${writing.id}`}>Open Writing module</Link>
      </Button>
      <TaskFooter saving={saving} disabled={false} onComplete={() => onComplete({})} label="Mark after AI feedback" />
    </div>
  );
}

function MixedTestTask({ task, saving, onComplete }: TaskProps) {
  const test = getPayload<TestDTO>(task, "test");
  const questions = getPayload<MixedQuestion[]>(task, "questions") ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answered = Object.keys(answers).length >= questions.length;

  if (test) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">{test.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{test.level} · {test.skill} · {test.questionsCount} questions</p>
          <p className="mt-1 text-xs text-muted-foreground">{test.timeLimit ? `${test.timeLimit} min limit` : "No timer"}</p>
        </div>
        <Button asChild className="w-full"><Link href={`/tests/${test.id}`}>Open Tests module</Link></Button>
        <TaskFooter saving={saving} disabled={false} onComplete={() => onComplete({})} label="Mark after test" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id} className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">{question.question}</p>
          <p className="mt-1 text-xs text-muted-foreground">{question.prompt_ru}</p>
          <div className="mt-3 grid gap-2">
            {question.options.map((option, index) => (
              <Button
                key={option}
                variant={answers[question.id] === index ? "secondary" : "outline"}
                className="justify-start whitespace-normal"
                onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <TaskFooter saving={saving} disabled={!answered} onComplete={() => onComplete({ answers })} label="Finish plan" />
    </div>
  );
}

function QuestionList({
  questions,
  answers,
  setAnswers,
}: {
  questions: MiniTestQuestion[];
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  return (
    <div className="space-y-3">
      {questions.map((question, questionIndex) => (
        <div key={`${question.question}-${questionIndex}`} className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">{question.question}</p>
          <div className="mt-3 grid gap-2">
            {question.options.map((option, optionIndex) => (
              <Button
                key={option}
                variant={answers[String(questionIndex)] === optionIndex ? "secondary" : "outline"}
                className="justify-start whitespace-normal"
                onClick={() => setAnswers((prev) => ({ ...prev, [String(questionIndex)]: optionIndex }))}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardWord({ word, current, total }: { word: WordDTO; current: number; total: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 text-center">
      <p className="text-xs text-muted-foreground">{current} of {total}</p>
      <h3 className="mt-2 text-3xl font-bold">{word.article ? `${word.article} ` : ""}{word.german}</h3>
      <p className="mt-2 text-base text-muted-foreground">{word.translation_ru}</p>
      {word.example_de ? <p className="mt-4 text-sm">{word.example_de}</p> : null}
      {word.example_ru ? <p className="mt-1 text-xs text-muted-foreground">{word.example_ru}</p> : null}
    </div>
  );
}

function TaskFooter({
  saving,
  disabled,
  onComplete,
  label = "Complete task",
}: {
  saving: boolean;
  disabled: boolean;
  onComplete: () => void;
  label?: string;
}) {
  return (
    <div className="border-t border-border pt-4">
      <Button className="h-12 w-full" disabled={disabled || saving} onClick={onComplete}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {label}
      </Button>
    </div>
  );
}

function ResultScreen({ result }: { result: Result | null }) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 pb-6">
      <section className="rounded-lg border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-3 text-3xl font-bold">Day Completed</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your progress was saved.</p>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ResultCard label="tasks" value={`${result?.tasks_completed ?? 0}/${result?.total_tasks ?? 0}`} />
        <ResultCard label="accuracy" value={`${result?.accuracy ?? 0}%`} />
        <ResultCard label="words learned" value={result?.words_learned ?? 0} />
        <ResultCard label="streak" value={`${result?.streak ?? 0} days`} />
      </section>
      {result?.weak_areas?.length ? (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="font-semibold">Weak areas to review</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.weak_areas.map((area) => <span key={area} className="rounded-full bg-muted px-3 py-1 text-sm">{area}</span>)}
          </div>
        </section>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild className="h-12">
          <Link href="/home"><Home className="h-4 w-4" />Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/srs"><RotateCcw className="h-4 w-4" />Review mistakes</Link>
        </Button>
      </div>
    </main>
  );
}

function ResultCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function MissingTaskData({ saving, onComplete }: Pick<TaskProps, "saving" | "onComplete">) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <p className="text-sm text-muted-foreground">No content is available for this task.</p>
      <TaskFooter saving={saving} disabled={false} onComplete={() => onComplete({})} label="Continue" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4" />
      {message}
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[50vh] place-items-center text-muted-foreground">{children}</div>;
}

type TaskProps = {
  task: PlanTask;
  saving: boolean;
  onComplete: (payload: Record<string, unknown>) => void;
};

function getWords(task: PlanTask) {
  return getPayload<WordDTO[]>(task, "words") ?? [];
}

function getPayload<T>(task: PlanTask, key: string): T | null {
  const value = task.payload[key];
  return value == null ? null : value as T;
}

function scoreQuestions(questions: MiniTestQuestion[], answers: Record<string, number>) {
  if (!questions.length) return 0;
  const correct = questions.reduce((sum, question, index) => sum + (answers[String(index)] === question.answer ? 1 : 0), 0);
  return Math.round((correct / questions.length) * 100);
}

function taskLabel(type: PlanStepType) {
  const labels: Record<PlanStepType, string> = {
    vocabulary_review: "Review vocabulary",
    new_words: "Learn new words",
    grammar: "Grammar lesson",
    reading: "Reading text",
    writing: "Writing task",
    test: "Mini test",
  };
  return labels[type];
}

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data;
}

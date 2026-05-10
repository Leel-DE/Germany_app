"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Loader2,
  Save,
  Send,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UserWriting, WritingFeedback, WritingTemplate } from "@/types";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function WritingTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<WritingTemplate | null>(null);
  const [text, setText] = useState("");
  const [submissions, setSubmissions] = useState<UserWriting[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const lastSavedText = useRef("");

  const selectedAttempt = submissions.find((item) => item.id === selectedAttemptId) ?? submissions.at(-1) ?? null;
  const feedback = selectedAttempt?.aiFeedback ?? null;
  const wordCount = useMemo(() => countWords(text), [text]);
  const tooShort = task ? wordCount > 0 && wordCount < task.minWords : false;
  const veryShort = task ? wordCount > 0 && wordCount < Math.floor(task.minWords * 0.5) : false;

  const saveDraft = useCallback(async (nextText: string, manual = false) => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/writing/tasks/${params.id}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nextText }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Draft was not saved");
      lastSavedText.current = nextText;
      setSaveState("saved");
      if (manual) setMessage("Draft saved.");
    } catch (err) {
      setSaveState("error");
      setMessage(err instanceof Error ? err.message : "Draft was not saved");
    }
  }, [params.id]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const [taskRes, draftRes, submissionsRes] = await Promise.all([
          fetch(`/api/writing/tasks/${params.id}`, { cache: "no-store" }),
          fetch(`/api/writing/tasks/${params.id}/draft`, { cache: "no-store" }),
          fetch(`/api/writing/tasks/${params.id}/submissions`, { cache: "no-store" }),
        ]);
        const [taskBody, draftBody, submissionsBody] = await Promise.all([
          taskRes.json().catch(() => null),
          draftRes.json().catch(() => null),
          submissionsRes.json().catch(() => null),
        ]);
        if (!taskRes.ok) throw new Error(taskBody?.error ?? "Writing task not found");
        if (!draftRes.ok) throw new Error(draftBody?.error ?? "Draft could not be loaded");
        if (!submissionsRes.ok) throw new Error(submissionsBody?.error ?? "Attempts could not be loaded");
        if (!alive) return;
        setTask(taskBody.task);
        setText(draftBody.draft?.text ?? "");
        lastSavedText.current = draftBody.draft?.text ?? "";
        const attempts = submissionsBody.submissions ?? [];
        setSubmissions(attempts);
        setSelectedAttemptId(attempts.at(-1)?.id ?? null);
      } catch (err) {
        if (alive) setMessage(err instanceof Error ? err.message : "Writing task could not be loaded");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.id]);

  useEffect(() => {
    if (loading || text === lastSavedText.current) return;
    const timer = window.setTimeout(() => {
      void saveDraft(text);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [loading, saveDraft, text]);

  async function submitForCheck() {
    if (!task) return;
    const trimmed = text.trim();
    setMessage(null);
    if (!trimmed) {
      setMessage("Write your text before submitting.");
      return;
    }
    if (trimmed.length < 30) {
      setMessage("Text is too short. Add a few complete sentences first.");
      return;
    }
    setChecking(true);
    try {
      await saveDraft(trimmed);
      const res = await fetch(`/api/writing/${task.id}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "AI check failed");
      const nextAttempt: UserWriting = {
        ...body.submission,
        text: trimmed,
        aiFeedback: body.feedback,
      };
      setSubmissions((prev) => [...prev, nextAttempt]);
      setSelectedAttemptId(nextAttempt.id);
      setMessage("Feedback saved. You can now rewrite and submit a new attempt.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "AI check failed");
    } finally {
      setChecking(false);
    }
  }

  function rewrite() {
    const source = feedback?.improvedVersion || feedback?.correctedText || text;
    setText(source);
    setMessage("Rewrite mode opened. Edit the text and submit again to create a new attempt.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <State icon={Loader2} title="Loading writing task" spin />;
  if (!task) return <State icon={AlertCircle} title="Writing task unavailable" text={message ?? "Task was not found."} />;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 pb-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/writing")} aria-label="Back to writing tasks">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight">{task.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant={task.level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{task.level}</Badge>
              <Badge variant="muted">{task.topic}</Badge>
              <Badge variant="outline">{task.type.replaceAll("_", " ")}</Badge>
              <Badge variant="outline">{task.estimatedMinutes} min</Badge>
            </div>
          </div>
        </div>

        {message ? <Message text={message} error={saveState === "error"} /> : null}

        <Panel icon={Target} title="Task">
          <p className="text-sm leading-6">{task.instructions}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Info label="Minimum" value={`${task.minWords} words`} />
            <Info label="Current" value={`${wordCount} words`} warning={tooShort} />
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel icon={CheckCircle2} title="Requirements">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {task.requirements.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </Panel>
          <Panel icon={Sparkles} title="Hints">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {task.hints.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </Panel>
        </div>

        <Panel icon={FileText} title="Useful phrases">
          <div className="flex flex-wrap gap-2">
            {task.usefulPhrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => setText((prev) => `${prev}${prev.endsWith("\n") || !prev ? "" : "\n"}${phrase}`)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {phrase}
              </button>
            ))}
          </div>
        </Panel>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Your text</h2>
              <p className="text-xs text-muted-foreground">{saveLabel(saveState)} · {wordCount}/{task.minWords} words</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => saveDraft(text, true)} disabled={saveState === "saving"}>
              {saveState === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save draft
            </Button>
          </div>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Sehr geehrte Damen und Herren..."
            className="min-h-[320px] resize-y text-base leading-7"
            maxLength={8000}
          />
          <div className="mt-3 space-y-2">
            {veryShort ? <Warning text="This is very short. AI will check it, but the score will stay low." /> : null}
            {tooShort && !veryShort ? <Warning text="Below the minimum word count. You can submit, but the score is capped." /> : null}
            <Button className="h-12 w-full" onClick={submitForCheck} disabled={checking || !text.trim()}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit for AI check
            </Button>
          </div>
        </section>

        {feedback ? <FeedbackPanel feedback={feedback} attempt={selectedAttempt} onRewrite={rewrite} taskId={task.id} /> : null}
      </section>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <Panel icon={Clock3} title="Attempts">
          {submissions.length ? (
            <div className="space-y-2">
              {submissions.map((attempt) => (
                <button
                  key={attempt.id}
                  type="button"
                  onClick={() => setSelectedAttemptId(attempt.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition",
                    selectedAttemptId === attempt.id ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">Attempt {attempt.attemptNumber}</span>
                    <span className="text-sm font-semibold">{attempt.score}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(attempt.createdAt).toLocaleString()}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attempts yet. Submit your first text to get feedback.</p>
          )}
        </Panel>

        <Panel icon={Copy} title="Ideal answer">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{task.idealAnswer}</p>
        </Panel>
      </aside>
    </main>
  );
}

function FeedbackPanel({ feedback, attempt, onRewrite, taskId }: { feedback: WritingFeedback; attempt: UserWriting | null; onRewrite: () => void; taskId: string }) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">AI feedback{attempt ? ` · Attempt ${attempt.attemptNumber}` : ""}</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-5xl font-bold text-primary">{feedback.score}</span>
            <span className="pb-2 text-sm text-muted-foreground">/100 · {feedback.estimatedLevel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRewrite}>Rewrite and improve</Button>
          <Button asChild variant="outline"><Link href="/writing">Next task</Link></Button>
        </div>
      </div>
      <p className="text-sm leading-6">{feedback.summary}</p>

      <div className="grid gap-3 lg:grid-cols-2">
        <TextBlock title="Corrected text" text={feedback.correctedText} />
        <TextBlock title="Improved version" text={feedback.improvedVersion} />
      </div>

      <FeedbackList title="Errors" empty="No concrete errors found.">
        {feedback.errors.map((error, index) => (
          <div key={`${error.original}-${index}`} className="rounded-lg border border-border bg-background p-3 text-sm">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Badge variant="outline">{error.type.replaceAll("_", " ")}</Badge>
              <Badge variant={error.severity === "high" ? "destructive" : error.severity === "medium" ? "warning" : "muted"}>{error.severity}</Badge>
            </div>
            <p><span className="font-medium">Original:</span> <span className="text-muted-foreground line-through">{error.original}</span></p>
            <p className="mt-1"><span className="font-medium">Correct:</span> <span className="text-success">{error.correct}</span></p>
            <p className="mt-2 text-muted-foreground">{error.explanationRu}</p>
          </div>
        ))}
      </FeedbackList>

      <div className="grid gap-3 lg:grid-cols-3">
        <ChipList title="Strengths" items={feedback.strengths} />
        <ChipList title="Suggestions" items={feedback.suggestions} />
        <ChipList title="Weak areas" items={feedback.weakAreas} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" onClick={onRewrite}>Rewrite and improve</Button>
        <Button variant="outline" onClick={() => window.alert("Weak areas are saved with this attempt and shown on the dashboard.")}>Add weak areas to practice</Button>
      </div>
      <p className="text-xs text-muted-foreground">Result is saved automatically after every AI check. Task id: {taskId}</p>
    </section>
  );
}

function Panel({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function FeedbackList({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">{children.length ? children : <p className="text-sm text-muted-foreground">{empty}</p>}</div>
    </div>
  );
}

function ChipList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.length ? items.map((item) => <Badge key={item} variant="muted">{item}</Badge>) : <span className="text-sm text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function Info({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-border bg-background p-3", warning && "border-warning/40 bg-warning/5")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function Message({ text, error }: { text: string; error?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3 text-sm", error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-primary/20 bg-primary/5")}>
      {text}
    </div>
  );
}

function Warning({ text }: { text: string }) {
  return <p className="rounded-lg border border-warning/30 bg-warning/5 p-2 text-xs text-warning">{text}</p>;
}

function State({ icon: Icon, title, text, spin }: { icon: LucideIcon; title: string; text?: string; spin?: boolean }) {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <Icon className={cn("mx-auto h-7 w-7 text-muted-foreground", spin && "animate-spin")} />
        <h1 className="mt-3 font-semibold">{title}</h1>
        {text ? <p className="mt-1 text-sm text-muted-foreground">{text}</p> : null}
      </div>
    </div>
  );
}

function saveLabel(state: SaveState) {
  if (state === "saving") return "Saving";
  if (state === "saved") return "Saved";
  if (state === "error") return "Autosave failed";
  return "Autosave ready";
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

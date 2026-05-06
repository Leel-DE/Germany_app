"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Lightbulb,
  Loader2,
  RefreshCw,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocale, useTranslations } from "next-intl";

type CEFRLevel = "A1" | "A2" | "B1" | "B2";
type Severity = "low" | "medium" | "high";
type ErrorType = "grammar" | "vocabulary" | "word_order" | "article" | "case" | "spelling" | "style";

interface WritingErrorDTO {
  type: ErrorType;
  original: string;
  correct: string;
  explanationRu: string;
  severity: Severity;
}

interface FeedbackDTO {
  score: number;
  estimatedLevel: CEFRLevel;
  summary: string;
  correctedText: string;
  improvedVersion: string;
  errors: WritingErrorDTO[];
  strengths: string[];
  suggestions: string[];
  weakAreas: string[];
  usefulPhrases: string[];
}

interface TaskDTO {
  id: string;
  title: string;
  type: string;
  topic: string;
  cefr_level: CEFRLevel;
  instructions: string;
  requirements: string[];
  hints: string[];
  useful_phrases: string[];
  min_words: number;
  estimated_minutes: number;
  ideal_answer: string;
}

interface SubmissionDTO {
  id: string;
  attempt_number: number;
  content: string;
  score: number | null;
  estimated_level: CEFRLevel | null;
  weak_areas: string[];
  errors_count: number | null;
  feedback: FeedbackDTO | null;
  submitted_at: string;
}

interface DraftDTO {
  text: string;
  updated_at: string;
}

type Phase = "loading" | "editor" | "checking" | "feedback" | "error";

const AUTOSAVE_DELAY = 1500;

export default function WritingTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("writing");
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>("loading");
  const [task, setTask] = useState<TaskDTO | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackDTO | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showHistory, setShowHistory] = useState(false);
  const [showIdeal, setShowIdeal] = useState(false);
  const [showImproved, setShowImproved] = useState(true);

  const initialDraftRef = useRef<string>("");
  const lastSavedTextRef = useRef<string>("");

  const wordCount = useMemo(() => countWords(text), [text]);

  const loadTask = useCallback(async () => {
    setPhase("loading");
    setErrorMsg("");
    try {
      const [taskRes, subsRes] = await Promise.all([
        fetch(`/api/writing/tasks/${params.id}`, { cache: "no-store" }),
        fetch(`/api/writing/tasks/${params.id}/submissions`, { cache: "no-store" }),
      ]);
      const taskJson = await taskRes.json().catch(() => null);
      if (!taskRes.ok) throw new Error(taskJson?.error ?? t("loadError"));
      const subsJson = subsRes.ok ? await subsRes.json().catch(() => ({ submissions: [] })) : { submissions: [] };
      const fetchedTask = taskJson.task as TaskDTO;
      const draft = (taskJson.draft as DraftDTO | null) ?? null;
      setTask(fetchedTask);
      setSubmissions((subsJson.submissions ?? []) as SubmissionDTO[]);
      const startingText = draft?.text ?? "";
      setText(startingText);
      initialDraftRef.current = startingText;
      lastSavedTextRef.current = startingText;
      setPhase("editor");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("loadError"));
      setPhase("error");
    }
  }, [params.id, t]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  // Autosave drafts (debounced) when in editor phase
  useEffect(() => {
    if (phase !== "editor" || !task) return;
    if (text === lastSavedTextRef.current) return;
    const handle = setTimeout(() => {
      void saveDraft(false);
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, phase, task]);

  const saveDraft = useCallback(
    async (manual: boolean) => {
      if (!task) return;
      if (text === lastSavedTextRef.current && !manual) return;
      setDraftStatus("saving");
      try {
        const res = await fetch(`/api/writing/tasks/${task.id}/draft`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("save failed");
        lastSavedTextRef.current = text;
        setDraftStatus("saved");
      } catch {
        setDraftStatus("error");
      }
    },
    [task, text]
  );

  const submit = useCallback(async () => {
    if (!task) return;
    if (text.trim().length === 0) return;
    setPhase("checking");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/writing/${task.id}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? t("checkError"));
      setFeedback(data.feedback as FeedbackDTO);
      // Refresh submissions list
      const subsRes = await fetch(`/api/writing/tasks/${task.id}/submissions`, { cache: "no-store" });
      const subsJson = subsRes.ok ? await subsRes.json().catch(() => ({ submissions: [] })) : { submissions: [] };
      setSubmissions((subsJson.submissions ?? []) as SubmissionDTO[]);
      lastSavedTextRef.current = "";
      setPhase("feedback");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("checkError"));
      setPhase("editor");
    }
  }, [task, text, locale, t]);

  const startRewrite = useCallback(() => {
    if (!feedback) {
      setPhase("editor");
      return;
    }
    // Pre-fill new draft with corrected text from feedback so user can iterate
    setText(feedback.correctedText || text);
    initialDraftRef.current = feedback.correctedText || text;
    lastSavedTextRef.current = "";
    setFeedback(null);
    setDraftStatus("idle");
    setPhase("editor");
  }, [feedback, text]);

  if (phase === "loading") {
    return (
      <CenteredState>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </CenteredState>
    );
  }

  if (phase === "error" || !task) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/writing")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <CenteredState>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{errorMsg || t("taskNotFound")}</p>
          <Button variant="outline" size="sm" onClick={() => loadTask()}>
            {t("retry")}
          </Button>
        </CenteredState>
      </div>
    );
  }

  const minWords = task.min_words;
  const tooShort = wordCount > 0 && wordCount < minWords;
  const isEmpty = text.trim().length === 0;
  const submitDisabled = isEmpty || phase === "checking";

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <header className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/writing")} aria-label={t("back")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold leading-tight">{task.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant={task.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{task.cefr_level}</Badge>
            <Badge variant="muted">{task.topic}</Badge>
            <Badge variant="outline" className="capitalize">
              {task.type.replace(/_/g, " ")}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {task.min_words} {t("wordsShort")} · {task.estimated_minutes} {t("minutesShort")}
            </span>
          </div>
        </div>
      </header>

      {phase === "checking" ? (
        <CenteredState>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("checking")}</p>
        </CenteredState>
      ) : phase === "feedback" && feedback ? (
        <FeedbackView
          feedback={feedback}
          onRewrite={startRewrite}
          onBack={() => router.push("/writing")}
          submissions={submissions}
          showImproved={showImproved}
          setShowImproved={setShowImproved}
        />
      ) : (
        <Editor
          task={task}
          text={text}
          setText={setText}
          wordCount={wordCount}
          tooShort={tooShort}
          isEmpty={isEmpty}
          minWords={minWords}
          submitDisabled={submitDisabled}
          submit={submit}
          saveDraft={() => saveDraft(true)}
          draftStatus={draftStatus}
          showIdeal={showIdeal}
          setShowIdeal={setShowIdeal}
          submissions={submissions}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          errorMsg={errorMsg}
        />
      )}
    </div>
  );
}

interface EditorProps {
  task: TaskDTO;
  text: string;
  setText: (s: string) => void;
  wordCount: number;
  tooShort: boolean;
  isEmpty: boolean;
  minWords: number;
  submitDisabled: boolean;
  submit: () => void;
  saveDraft: () => void;
  draftStatus: "idle" | "saving" | "saved" | "error";
  showIdeal: boolean;
  setShowIdeal: (v: boolean) => void;
  submissions: SubmissionDTO[];
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  errorMsg: string;
}

function Editor(props: EditorProps) {
  const t = useTranslations("writing");
  const {
    task,
    text,
    setText,
    wordCount,
    tooShort,
    isEmpty,
    minWords,
    submitDisabled,
    submit,
    saveDraft,
    draftStatus,
    showIdeal,
    setShowIdeal,
    submissions,
    showHistory,
    setShowHistory,
    errorMsg,
  } = props;

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{t("task")}</p>
        <p className="whitespace-pre-line text-sm leading-relaxed">{task.instructions}</p>
        {task.requirements.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs leading-snug text-foreground/80">
            {task.requirements.map((req, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-primary">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {task.hints.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            {t("hints")}
          </p>
          <ul className="space-y-1 text-xs leading-snug text-foreground/80">
            {task.hints.map((hint, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-muted-foreground">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {task.useful_phrases.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("usefulPhrases")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {task.useful_phrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => setText(text + (text && !text.endsWith("\n") ? "\n" : "") + phrase)}
                className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs transition-colors hover:bg-muted/80"
              >
                {phrase}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 8000))}
          placeholder={t("placeholder")}
          className="min-h-[260px] font-mono text-sm"
          aria-label={t("editorLabel")}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            {wordCount} {t("wordsShort")}
            {minWords ? ` / ${minWords}` : ""}
            {tooShort && (
              <span className="ml-2 text-amber-600">
                {t("tooShortWarning", { min: minWords })}
              </span>
            )}
          </span>
          <span>
            {draftStatus === "saving" && (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("autosaveSaving")}
              </span>
            )}
            {draftStatus === "saved" && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                {t("autosaveSaved")}
              </span>
            )}
            {draftStatus === "error" && <span className="text-destructive">{t("autosaveError")}</span>}
          </span>
        </div>
      </section>

      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1 gap-2" onClick={saveDraft} disabled={draftStatus === "saving"}>
          <Save className="h-4 w-4" />
          {t("saveDraft")}
        </Button>
        <Button className="flex-1 gap-2" onClick={submit} disabled={submitDisabled}>
          <Send className="h-4 w-4" />
          {t("checkAndSave")}
        </Button>
      </div>

      <CollapsibleSection
        title={t("idealAnswerTitle")}
        open={showIdeal}
        onToggle={() => setShowIdeal(!showIdeal)}
      >
        <p className="whitespace-pre-line rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
          {task.ideal_answer || t("noIdealAnswer")}
        </p>
      </CollapsibleSection>

      {submissions.length > 0 && (
        <CollapsibleSection
          title={
            <span className="inline-flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              {t("attemptsHistory")} ({submissions.length})
            </span>
          }
          open={showHistory}
          onToggle={() => setShowHistory(!showHistory)}
        >
          <ul className="space-y-2">
            {submissions.map((sub) => (
              <li key={sub.id} className="rounded-lg border border-border bg-card p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("attemptN", { n: sub.attempt_number })}</span>
                  <span className="text-muted-foreground">
                    {sub.score ?? "—"} · {new Date(sub.submitted_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-foreground/80">{sub.content}</p>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
}

interface FeedbackViewProps {
  feedback: FeedbackDTO;
  onRewrite: () => void;
  onBack: () => void;
  submissions: SubmissionDTO[];
  showImproved: boolean;
  setShowImproved: (v: boolean) => void;
}

function FeedbackView({ feedback, onRewrite, onBack, submissions, showImproved, setShowImproved }: FeedbackViewProps) {
  const t = useTranslations("writing");
  const scoreColor =
    feedback.score >= 80 ? "text-emerald-600" : feedback.score >= 60 ? "text-primary" : feedback.score >= 40 ? "text-amber-600" : "text-destructive";

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("score")}</p>
            <p className={`mt-1 text-4xl font-bold ${scoreColor}`}>{feedback.score}</p>
            <Badge variant={feedback.estimatedLevel.toLowerCase() as "a1" | "a2" | "b1" | "b2"} className="mt-2">
              {t("estimatedLevel")}: {feedback.estimatedLevel}
            </Badge>
          </div>
          <Sparkles className="h-6 w-6 shrink-0 text-primary" />
        </div>
        <p className="mt-3 text-sm leading-relaxed">{feedback.summary}</p>
      </section>

      {feedback.errors.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("errors")} ({feedback.errors.length})
          </h2>
          <ul className="space-y-2">
            {feedback.errors.map((err, i) => (
              <ErrorCard key={i} error={err} />
            ))}
          </ul>
        </section>
      )}

      <CollapsibleSection title={t("correctedText")} open onToggle={() => undefined} hideToggle>
        <p className="whitespace-pre-line rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
          {feedback.correctedText || t("emptySection")}
        </p>
      </CollapsibleSection>

      {feedback.improvedVersion && (
        <CollapsibleSection
          title={t("improvedVersion")}
          open={showImproved}
          onToggle={() => setShowImproved(!showImproved)}
        >
          <p className="whitespace-pre-line rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
            {feedback.improvedVersion}
          </p>
        </CollapsibleSection>
      )}

      <Section title={t("strengths")} items={feedback.strengths} accent="emerald" />
      <Section title={t("suggestions")} items={feedback.suggestions} accent="primary" />
      <TagSection title={t("weakAreas")} items={feedback.weakAreas} />
      <TagSection title={t("usefulPhrases")} items={feedback.usefulPhrases} />

      {submissions.length > 1 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("compareAttempts")}
          </p>
          <ul className="space-y-1.5 text-xs">
            {submissions.slice(0, 5).map((sub) => (
              <li key={sub.id} className="flex items-center justify-between">
                <span>
                  #{sub.attempt_number} · {new Date(sub.submitted_at).toLocaleString()}
                </span>
                <span className="font-medium">{sub.score ?? "—"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button className="gap-2" onClick={onRewrite}>
          <RefreshCw className="h-4 w-4" />
          {t("rewriteAndImprove")}
        </Button>
        <Button variant="outline" onClick={onBack}>
          {t("nextTask")}
        </Button>
      </div>
    </div>
  );
}

function ErrorCard({ error }: { error: WritingErrorDTO }) {
  const severityClass =
    error.severity === "high"
      ? "border-destructive/40 bg-destructive/5"
      : error.severity === "medium"
        ? "border-amber-500/40 bg-amber-500/5"
        : "border-border bg-card";
  return (
    <li className={`rounded-lg border p-3 text-sm ${severityClass}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="capitalize">
          {error.type.replace(/_/g, " ")}
        </Badge>
        <Badge variant={error.severity === "high" ? "destructive" : "muted"}>{error.severity}</Badge>
      </div>
      <p className="mt-2 text-sm">
        <span className="text-muted-foreground line-through">{error.original}</span>
        <span className="mx-2 text-muted-foreground/70">→</span>
        <span className="font-medium text-emerald-600">{error.correct}</span>
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{error.explanationRu}</p>
    </li>
  );
}

function Section({ title, items, accent }: { title: string; items: string[]; accent: "emerald" | "primary" }) {
  if (!items.length) return null;
  const dot = accent === "emerald" ? "text-emerald-600" : "text-primary";
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1 text-xs leading-snug">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1.5">
            <span className={dot}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TagSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
  hideToggle = false,
}: {
  title: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hideToggle?: boolean;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <button
        type="button"
        onClick={onToggle}
        disabled={hideToggle}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <span>{title}</span>
        {!hideToggle && (open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[40vh] place-items-center gap-2 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).filter(Boolean).length;
}

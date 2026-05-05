"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { WritingFeedback, WritingTemplate } from "@/types";
import { useTranslations } from "next-intl";

type Phase = "write" | "checking" | "feedback";

export default function WritingEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<WritingTemplate | null>(null);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("write");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("writing");

  useEffect(() => {
    fetch(`/api/writing/tasks/${params.id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setTask(data.task ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const check = async () => {
    if (!task || text.trim().length < 30) return;
    setPhase("checking");
    const res = await fetch("/api/ai/check-writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, templateTitle: task.title, cefrLevel: task.cefr_level }),
    });
    const data = res.ok ? await res.json() : null;
    const nextFeedback = data?.feedback ?? fallbackFeedback(task.cefr_level);
    setFeedback(nextFeedback);
    await fetch("/api/writing/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        text,
        feedback: nextFeedback,
        score: nextFeedback.overall_score,
      }),
    });
    setPhase("feedback");
  };

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" /></State>;
  if (!task) return <State>{t("taskNotFound")}</State>;

  if (phase === "checking") {
    return <State><Loader2 className="h-8 w-8 animate-spin" />{t("checking")}</State>;
  }

  if (phase === "feedback" && feedback) {
    return (
      <div className="space-y-5 animate-fade-slide-up">
        <Button variant="ghost" size="sm" onClick={() => router.push("/writing")}><ArrowLeft className="mr-2 h-4 w-4" />{t("back")}</Button>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("score")}</p>
          <p className="text-4xl font-bold text-primary">{feedback.overall_score}</p>
          <p className="mt-2 text-sm">{feedback.positive_feedback}</p>
        </div>
        {feedback.errors.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">{t("errors")}</h2>
            {feedback.errors.map((error, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 text-sm">
                <p><span className="line-through text-muted-foreground">{error.original}</span> {"->"} <span className="font-medium text-success">{error.correction}</span></p>
                <p className="mt-1 text-xs text-muted-foreground">{error.explanation}</p>
              </div>
            ))}
          </section>
        )}
        <Button className="w-full" onClick={() => router.push("/writing")}>{t("chooseAnother")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/writing")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-base font-bold leading-tight">{task.title}</h1>
          <p className="text-xs text-muted-foreground">{task.cefr_level} · {task.topic}</p>
        </div>
      </div>

      <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="mb-1.5 text-xs font-semibold text-primary">{t("task")}</p>
        <p className="text-sm leading-relaxed">{task.prompt}</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("usefulPhrases")}</p>
        <div className="flex flex-wrap gap-1.5">
          {task.key_phrases.map((phrase) => (
            <button key={phrase} onClick={() => setText((prev) => prev + (prev ? "\n" : "") + phrase)} className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs">
              {phrase}
            </button>
          ))}
        </div>
      </section>

      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Sehr geehrte Damen und Herren..." className="min-h-[240px] font-mono text-sm" />
      <Button className="h-12 w-full gap-2" disabled={text.trim().length < 30} onClick={check}>
        <Send className="h-4 w-4" />{t("checkAndSave")}
      </Button>
    </div>
  );
}

function fallbackFeedback(level: "A1" | "A2" | "B1" | "B2"): WritingFeedback {
  return {
    overall_score: 70,
    level_assessment: level,
    errors: [],
    style_tips: ["Add concrete dates, names, and a clear request."],
    structure_feedback: "The text was saved. Configure an AI provider for detailed feedback.",
    positive_feedback: "Submission saved successfully.",
    suggested_phrases: [],
  };
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[50vh] place-items-center gap-2 text-center text-muted-foreground">{children}</div>;
}

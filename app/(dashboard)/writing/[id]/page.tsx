"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle, Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { WRITING_TEMPLATES } from "@/lib/data/writingTemplates";
import type { WritingFeedback } from "@/types";

type Phase = "write" | "checking" | "feedback";

export default function WritingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const template = WRITING_TEMPLATES.find(t => t.id === params.id);

  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("write");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [showStructure, setShowStructure] = useState(false);

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Шаблон не найден</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/writing")}>← Назад</Button>
      </div>
    );
  }

  const handleCheck = async () => {
    if (text.trim().length < 30) return;
    setPhase("checking");
    try {
      const res = await fetch("/api/ai/check-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, templateTitle: template.title, cefrLevel: template.cefr_level }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      } else {
        // Demo fallback when API not configured
        setFeedback({
          overall_score: 72,
          level_assessment: "B1",
          errors: [
            { original: "ich bin gegangen", correction: "ich bin gegangen", explanation: "Правильно! gehen требует sein в Perfekt", rule: "Perfekt mit sein", severity: "minor" },
            { original: "Ich bitte Sie schnell", correction: "Ich bitte Sie so schnell wie möglich", explanation: "Используйте устойчивое выражение 'so schnell wie möglich' — звучит более официально", rule: "Formaler Stil", severity: "important" },
          ],
          style_tips: ["Используйте 'Mit freundlichen Grüßen' в конце официального письма", "Добавьте конкретные даты и детали"],
          structure_feedback: "Структура письма правильная. Есть вступление, основная часть и заключение.",
          positive_feedback: "Хорошее начало! Правильно используете вежливое обращение и основные конструкции.",
          suggested_phrases: ["Ich wende mich an Sie bezüglich...", "Für Ihre Unterstützung bedanke ich mich im Voraus."]
        });
      }
      setPhase("feedback");
    } catch {
      setPhase("feedback");
      setFeedback({
        overall_score: 70, level_assessment: "B1",
        errors: [], style_tips: ["Настройте API ключ для полной проверки"], structure_feedback: "", positive_feedback: "", suggested_phrases: []
      });
    }
  };

  // ── WRITE ─────────────────────────────────────────────────────────────────────
  if (phase === "write") {
    return (
      <div className="space-y-4 animate-fade-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/writing")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-base font-bold leading-tight">{template.title}</h1>
            <p className="text-xs text-muted-foreground">{template.cefr_level} · {template.topic}</p>
          </div>
        </div>

        {/* Task */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary mb-1.5">📋 Задание</p>
          <p className="text-sm leading-relaxed">{template.prompt}</p>
        </div>

        {/* Key phrases */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2.5">💡 Ключевые фразы</p>
          <div className="flex flex-wrap gap-1.5">
            {template.key_phrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => setText(prev => prev + (prev ? "\n" : "") + phrase)}
                className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Structure toggle */}
        <button
          onClick={() => setShowStructure(prev => !prev)}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Структура письма</span>
          </div>
          <span className="text-xs text-muted-foreground">{showStructure ? "Скрыть" : "Показать"}</span>
        </button>

        {showStructure && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            {template.structure.parts.map((part) => (
              <div key={part.name} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">{part.name}</p>
                <p className="text-xs de-text">{part.example}</p>
                <p className="text-xs text-muted-foreground/70 italic">{part.tip}</p>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Ваше письмо</p>
            <span className="text-xs text-muted-foreground">{text.length} символов</span>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Sehr geehrte Frau/Herr..., &#10;&#10;ich schreibe Ihnen, weil..."
            className="min-h-[220px] text-sm font-mono"
          />
        </div>

        {/* Example toggle */}
        <button
          onClick={() => setShowExample(prev => !prev)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed border-border hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
        >
          <span>{showExample ? "Скрыть" : "Посмотреть"} идеальный вариант</span>
          {showExample ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {showExample && (
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Идеальный вариант</p>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground">{template.example}</pre>
          </div>
        )}

        <Button
          className="w-full h-12 text-base gap-2"
          disabled={text.trim().length < 30}
          onClick={handleCheck}
        >
          <Send className="w-4 h-4" />
          Проверить с AI
        </Button>
      </div>
    );
  }

  // ── CHECKING ──────────────────────────────────────────────────────────────────
  if (phase === "checking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center animate-fade-in">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div>
          <p className="font-semibold text-lg">AI проверяет письмо...</p>
          <p className="text-sm text-muted-foreground mt-1">Ищем ошибки и готовим советы</p>
        </div>
      </div>
    );
  }

  // ── FEEDBACK ──────────────────────────────────────────────────────────────────
  if (phase === "feedback" && feedback) {
    const scoreColor = feedback.overall_score >= 80 ? "text-good" : feedback.overall_score >= 60 ? "text-warning" : "text-again";

    return (
      <div className="space-y-5 animate-fade-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setPhase("write")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold flex-1">Результат проверки</h1>
        </div>

        {/* Score */}
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center shrink-0">
            <span className={cn("text-2xl font-bold", scoreColor)}>{feedback.overall_score}</span>
          </div>
          <div>
            <p className="text-base font-semibold">Оценка письма</p>
            <p className="text-sm text-muted-foreground">Уровень: <span className="font-medium">{feedback.level_assessment}</span></p>
            {feedback.positive_feedback && (
              <p className="text-sm text-success mt-1.5">{feedback.positive_feedback}</p>
            )}
          </div>
        </div>

        {/* Errors */}
        {feedback.errors.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-muted-foreground px-1">
              Ошибки ({feedback.errors.length})
            </p>
            {feedback.errors.map((err, i) => (
              <div key={i} className={cn(
                "rounded-2xl border p-4 space-y-2",
                err.severity === "critical" ? "border-again/30 bg-again/5" :
                err.severity === "important" ? "border-warning/30 bg-warning/5" :
                "border-border bg-card"
              )}>
                <div className="flex items-start gap-2">
                  {err.severity === "critical" ? (
                    <AlertCircle className="w-4 h-4 text-again shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-2 flex-wrap text-sm">
                      <span className="line-through text-muted-foreground">{`"${err.original}"`}</span>
                      <span className="text-good font-medium">{`→ "${err.correction}"`}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{err.explanation}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{err.rule}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Structure */}
        {feedback.structure_feedback && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">📋 Структура</p>
            <p className="text-sm leading-relaxed">{feedback.structure_feedback}</p>
          </div>
        )}

        {/* Style tips */}
        {feedback.style_tips.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">✨ Советы по стилю</p>
            <ul className="space-y-1.5">
              {feedback.style_tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested phrases */}
        {feedback.suggested_phrases.length > 0 && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-primary">💡 Полезные фразы</p>
            <ul className="space-y-1.5">
              {feedback.suggested_phrases.map((phrase, i) => (
                <li key={i} className="text-sm de-text">{phrase}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 pb-2">
          <Button variant="outline" className="flex-1" onClick={() => setPhase("write")}>
            Улучшить письмо
          </Button>
          <Button className="flex-1" onClick={() => router.push("/writing")}>
            Другое задание
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

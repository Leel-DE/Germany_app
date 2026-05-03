"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GRAMMAR_TOPICS } from "@/lib/data/grammarTopics";

type Phase = "lesson" | "exercises" | "test" | "results";

const speak = (text: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "de-DE"; utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }
};

export default function GrammarLessonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const topic = GRAMMAR_TOPICS.find(t => t.slug === slug);

  const [phase, setPhase] = useState<Phase>("lesson");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testAnswers, setTestAnswers] = useState<(number | null)[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testSelected, setTestSelected] = useState<number | null>(null);
  const [testShowExplanation, setTestShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Тема не найдена</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/grammar")}>← Назад</Button>
      </div>
    );
  }

  // ── LESSON ──────────────────────────────────────────────────────────────────
  if (phase === "lesson") {
    return (
      <div className="space-y-5 animate-fade-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/grammar")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{topic.title_de}</h1>
              <Badge variant={topic.cefr_level.toLowerCase() as "a2"|"b1"}>{topic.cefr_level}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{topic.title_ru}</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Объяснение</p>
          <p className="text-sm leading-relaxed">{topic.content_json.explanation}</p>
        </div>

        {/* Rules */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Правила с примерами</p>
          {topic.content_json.rules.map((rule, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <p className="text-sm font-medium">{rule.rule}</p>
              <div className="bg-primary/5 rounded-xl p-3 space-y-1">
                <div className="flex items-start gap-2">
                  <p className="de-text text-sm leading-relaxed flex-1">{rule.example_de}</p>
                  <button onClick={() => speak(rule.example_de)} className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{rule.example_ru}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Typical errors */}
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <p className="text-sm font-semibold">Типичные ошибки</p>
          </div>
          <ul className="space-y-1.5">
            {topic.content_json.typical_errors.map((err, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted-foreground">{err}</li>
            ))}
          </ul>
        </div>

        {/* Real life */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary mb-2">🌍 В реальной жизни</p>
          <p className="text-sm leading-relaxed">{topic.content_json.real_life_connection}</p>
        </div>

        <Button className="w-full h-12 text-base gap-2" onClick={() => setPhase("exercises")}>
          Перейти к упражнениям
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ── EXERCISES ────────────────────────────────────────────────────────────────
  if (phase === "exercises") {
    const exercise = topic.exercises[exerciseIndex];
    if (!exercise) return null;
    const isLast = exerciseIndex === topic.exercises.length - 1;
    const isCorrect = selectedAnswer !== null && (
      exercise.type === "choose_correct"
        ? selectedAnswer === exercise.answer
        : String(selectedAnswer).toLowerCase().trim() === String(exercise.answer).toLowerCase().trim()
    );

    return (
      <div className="space-y-5 animate-fade-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setPhase("lesson")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Упражнение {exerciseIndex + 1} / {topic.exercises.length}
            </p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${((exerciseIndex + 1) / topic.exercises.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-medium">
            {exercise.type === "fill_blank" ? exercise.sentence : exercise.question}
          </p>

          {exercise.type === "choose_correct" && Array.isArray(exercise.options) && (
            <div className="space-y-2">
              {(exercise.options as string[]).map((opt, i) => (
                <button
                  key={i}
                  disabled={showExplanation}
                  onClick={() => { setSelectedAnswer(i); setShowExplanation(true); }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all",
                    !showExplanation && "border-border hover:border-primary/50 hover:bg-primary/5",
                    showExplanation && i === exercise.answer && "border-good bg-good/10",
                    showExplanation && selectedAnswer === i && i !== exercise.answer && "border-again bg-again/10",
                    showExplanation && selectedAnswer !== i && i !== exercise.answer && "border-border opacity-50",
                  )}
                >
                  <span className="font-medium text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {exercise.type === "fill_blank" && Array.isArray(exercise.options) && (
            <div className="flex gap-2 flex-wrap">
              {(exercise.options as string[]).map((opt) => (
                <button
                  key={opt}
                  disabled={showExplanation}
                  onClick={() => { setSelectedAnswer(opt); setShowExplanation(true); }}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                    !showExplanation && "border-border hover:border-primary/50 bg-muted",
                    showExplanation && opt === exercise.answer && "border-good bg-good/10 text-good",
                    showExplanation && selectedAnswer === opt && opt !== exercise.answer && "border-again bg-again/10 text-again",
                    showExplanation && selectedAnswer !== opt && opt !== exercise.answer && "border-border opacity-40",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {showExplanation && exercise.explanation && (
            <div className={cn(
              "rounded-xl p-3 text-sm space-y-1 border-l-4 animate-fade-in",
              isCorrect ? "bg-success/10 border-success" : "bg-again/10 border-again"
            )}>
              <div className="flex items-center gap-1.5 font-semibold">
                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-again" />}
                <span>{isCorrect ? "Правильно!" : "Неверно"}</span>
              </div>
              <p className="text-muted-foreground">{exercise.explanation}</p>
            </div>
          )}
        </div>

        {showExplanation && (
          <Button
            className="w-full h-12"
            onClick={() => {
              if (isLast) {
                setPhase("test");
                setTestAnswers(new Array(topic.mini_test.length).fill(null));
              } else {
                setExerciseIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowExplanation(false);
              }
            }}
          >
            {isLast ? "Перейти к мини-тесту 🏆" : "Следующее упражнение"} <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // ── MINI TEST ─────────────────────────────────────────────────────────────────
  if (phase === "test") {
    const question = topic.mini_test[testIndex];
    if (!question) return null;
    const isTestCorrect = testSelected === question.answer;

    return (
      <div className="space-y-5 animate-fade-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1 font-semibold">🏆 Мини-тест · вопрос {testIndex + 1}/{topic.mini_test.length}</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((testIndex + 1) / topic.mini_test.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-base font-semibold">{question.question}</p>
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <button
                key={i}
                disabled={testShowExplanation}
                onClick={() => { setTestSelected(i); setTestShowExplanation(true); }}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all",
                  !testShowExplanation && "border-border hover:border-primary/50 hover:bg-primary/5",
                  testShowExplanation && i === question.answer && "border-good bg-good/10",
                  testShowExplanation && testSelected === i && i !== question.answer && "border-again bg-again/10",
                  testShowExplanation && testSelected !== i && i !== question.answer && "border-border opacity-50",
                )}
              >
                <span className="font-medium text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {testShowExplanation && (
            <div className={cn(
              "rounded-xl p-3 text-sm space-y-1 border-l-4 animate-fade-in",
              isTestCorrect ? "bg-success/10 border-success" : "bg-again/10 border-again"
            )}>
              <div className="flex items-center gap-1.5 font-semibold">
                {isTestCorrect ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-again" />}
                <span>{isTestCorrect ? "Правильно!" : `Неверно. Правильно: ${question.options[question.answer]}`}</span>
              </div>
              <p className="text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </div>

        {testShowExplanation && (
          <Button
            className="w-full h-12"
            onClick={() => {
              const newAnswers = [...testAnswers];
              newAnswers[testIndex] = testSelected;
              setTestAnswers(newAnswers);
              if (testIndex === topic.mini_test.length - 1) {
                const correct = newAnswers.filter((a, i) => a === topic.mini_test[i].answer).length;
                setScore(Math.round((correct / topic.mini_test.length) * 100));
                setPhase("results");
              } else {
                setTestIndex(prev => prev + 1);
                setTestSelected(null);
                setTestShowExplanation(false);
              }
            }}
          >
            {testIndex === topic.mini_test.length - 1 ? "Завершить тест" : "Следующий вопрос"} <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (phase === "results") {
    const correct = testAnswers.filter((a, i) => a === topic.mini_test[i].answer).length;
    const emoji = score >= 80 ? "🎉" : score >= 60 ? "👍" : "💪";
    const message = score >= 80 ? "Отлично!" : score >= 60 ? "Хорошо!" : "Нужно повторить";

    return (
      <div className="flex flex-col items-center text-center space-y-5 py-4 animate-fade-slide-up">
        <div className="text-5xl">{emoji}</div>
        <div>
          <h2 className="text-2xl font-bold">{message}</h2>
          <p className="text-muted-foreground mt-1">Тема: {topic.title_de}</p>
        </div>
        <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center relative">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{score}%</p>
            <p className="text-xs text-muted-foreground">{correct}/{topic.mini_test.length} верно</p>
          </div>
        </div>
        {score < 80 && (
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 w-full text-left">
            <p className="text-sm font-semibold text-warning mb-2">⚠ Нужно повторить</p>
            <ul className="space-y-1">
              {testAnswers.map((ans, i) => {
                if (ans !== topic.mini_test[i].answer) {
                  return (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {topic.mini_test[i].question} → <span className="text-good font-medium">{topic.mini_test[i].options[topic.mini_test[i].answer]}</span>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        )}
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={() => { setPhase("lesson"); setExerciseIndex(0); setTestIndex(0); setTestAnswers([]); setTestSelected(null); setTestShowExplanation(false); setSelectedAnswer(null); setShowExplanation(false); }}>
            Пройти снова
          </Button>
          <Button className="flex-1" onClick={() => router.push("/grammar")}>
            Все темы
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

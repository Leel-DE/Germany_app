"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Volume2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlaybackSpeed = "normal" | "slow";

interface ListeningLine {
  speaker: string;
  text_de: string;
  text_ru: string;
}

interface ListeningQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface ListeningTrack {
  id: string;
  title: string;
  topic: string;
  cefr_level: "A2" | "B1";
  durationMin: number;
  goal: string;
  keywords: string[];
  lines: ListeningLine[];
  questions: ListeningQuestion[];
}

const TRACKS: ListeningTrack[] = [
  {
    id: "arzttermin",
    title: "Einen Arzttermin vereinbaren",
    topic: "Gesundheit",
    cefr_level: "A2",
    durationMin: 3,
    goal: "Понять дату, время и причину визита",
    keywords: ["Termin", "Beschwerden", "Versicherungskarte", "Donnerstag"],
    lines: [
      { speaker: "Patient", text_de: "Guten Morgen, ich möchte bitte einen Termin beim Arzt vereinbaren.", text_ru: "Доброе утро, я хотел бы записаться к врачу." },
      { speaker: "Praxis", text_de: "Guten Morgen. Haben Sie akute Beschwerden?", text_ru: "Доброе утро. У вас острые жалобы?" },
      { speaker: "Patient", text_de: "Ja, ich habe seit drei Tagen Husten und Fieber.", text_ru: "Да, у меня уже три дня кашель и температура." },
      { speaker: "Praxis", text_de: "Wir haben am Donnerstag um neun Uhr dreißig einen freien Termin.", text_ru: "У нас есть свободное время в четверг в 9:30." },
      { speaker: "Patient", text_de: "Das passt gut. Soll ich meine Versicherungskarte mitbringen?", text_ru: "Это подходит. Мне принести карточку страховки?" },
      { speaker: "Praxis", text_de: "Ja, bitte bringen Sie Ihre Versicherungskarte und Ihren Ausweis mit.", text_ru: "Да, пожалуйста, принесите карточку страховки и удостоверение личности." },
    ],
    questions: [
      {
        question: "Почему пациент звонит в практику?",
        options: ["Он хочет отменить запись", "Он хочет записаться к врачу", "Он ищет новую Krankenkasse"],
        answer: 1,
        explanation: "В начале он говорит: einen Termin beim Arzt vereinbaren.",
      },
      {
        question: "Когда назначен термин?",
        options: ["В четверг в 9:30", "В пятницу в 10:30", "В четверг в 19:30"],
        answer: 0,
        explanation: "Регистратура говорит: am Donnerstag um neun Uhr dreißig.",
      },
      {
        question: "Что нужно взять с собой?",
        options: ["Только рецепт", "Карточку страховки и Ausweis", "Письмо от работодателя"],
        answer: 1,
        explanation: "Нужно принести Versicherungskarte und Ausweis.",
      },
    ],
  },
  {
    id: "wohnung",
    title: "Wohnungsbesichtigung",
    topic: "Wohnung",
    cefr_level: "B1",
    durationMin: 4,
    goal: "Понять условия аренды и детали квартиры",
    keywords: ["Miete", "Nebenkosten", "Kaution", "Einzug"],
    lines: [
      { speaker: "Interessent", text_de: "Guten Tag, ich interessiere mich für die Wohnung in der dritten Etage.", text_ru: "Добрый день, меня интересует квартира на третьем этаже." },
      { speaker: "Vermieterin", text_de: "Guten Tag. Die Wohnung hat zwei Zimmer, eine Küche und einen Balkon.", text_ru: "Добрый день. В квартире две комнаты, кухня и балкон." },
      { speaker: "Interessent", text_de: "Wie hoch ist die Warmmiete?", text_ru: "Сколько составляет аренда с коммунальными расходами?" },
      { speaker: "Vermieterin", text_de: "Die Warmmiete beträgt achthundertfünfzig Euro. Die Kaution sind zwei Monatsmieten.", text_ru: "Warmmiete составляет 850 евро. Залог - две месячные аренды." },
      { speaker: "Interessent", text_de: "Ab wann kann man einziehen?", text_ru: "С какого времени можно въехать?" },
      { speaker: "Vermieterin", text_de: "Der Einzug ist ab dem ersten Juni möglich. Haustiere sind nach Absprache erlaubt.", text_ru: "Въезд возможен с первого июня. Домашние животные разрешены по согласованию." },
    ],
    questions: [
      {
        question: "Сколько комнат в квартире?",
        options: ["Одна", "Две", "Три"],
        answer: 1,
        explanation: "Vermieterin sagt: Die Wohnung hat zwei Zimmer.",
      },
      {
        question: "Какая Warmmiete?",
        options: ["580 Euro", "850 Euro", "950 Euro"],
        answer: 1,
        explanation: "Die Warmmiete beträgt achthundertfünfzig Euro.",
      },
      {
        question: "Когда можно въехать?",
        options: ["С первого мая", "С первого июня", "С пятнадцатого июня"],
        answer: 1,
        explanation: "Der Einzug ist ab dem ersten Juni möglich.",
      },
    ],
  },
  {
    id: "supermarkt",
    title: "An der Supermarktkasse",
    topic: "Alltag",
    cefr_level: "A2",
    durationMin: 2,
    goal: "Распознать цену, способ оплаты и просьбу",
    keywords: ["Tüte", "Karte", "bar", "Bon"],
    lines: [
      { speaker: "Kassierer", text_de: "Guten Abend. Haben Sie eine Kundenkarte?", text_ru: "Добрый вечер. У вас есть карта клиента?" },
      { speaker: "Kundin", text_de: "Nein, leider nicht. Ich brauche bitte noch eine Tüte.", text_ru: "Нет, к сожалению. Мне нужен ещё пакет." },
      { speaker: "Kassierer", text_de: "Gerne. Das macht zusammen siebenundzwanzig Euro vierzig.", text_ru: "Конечно. Всего 27 евро 40 центов." },
      { speaker: "Kundin", text_de: "Kann ich mit Karte bezahlen?", text_ru: "Можно оплатить картой?" },
      { speaker: "Kassierer", text_de: "Ja, natürlich. Möchten Sie den Bon?", text_ru: "Да, конечно. Хотите чек?" },
      { speaker: "Kundin", text_de: "Nein danke. Schönen Abend noch!", text_ru: "Нет, спасибо. Хорошего вечера!" },
    ],
    questions: [
      {
        question: "Что просит покупательница?",
        options: ["Пакет", "Скидку", "Новую карту"],
        answer: 0,
        explanation: "Она говорит: Ich brauche bitte noch eine Tüte.",
      },
      {
        question: "Сколько нужно заплатить?",
        options: ["17,40 Euro", "27,40 Euro", "72,40 Euro"],
        answer: 1,
        explanation: "Кассир говорит: siebenundzwanzig Euro vierzig.",
      },
      {
        question: "Покупательница берёт чек?",
        options: ["Да", "Нет", "Не сказано"],
        answer: 1,
        explanation: "Она отвечает: Nein danke.",
      },
    ],
  },
];

export default function ListeningPage() {
  const [activeTrackId, setActiveTrackId] = useState(TRACKS[0].id);
  const [speed, setSpeed] = useState<PlaybackSpeed>("normal");
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const activeTrack = useMemo(
    () => TRACKS.find((track) => track.id === activeTrackId) ?? TRACKS[0],
    [activeTrackId]
  );

  const answeredCount = Object.keys(answers).length;
  const correctCount = activeTrack.questions.filter((question, index) => answers[index] === question.answer).length;
  const score = answeredCount === activeTrack.questions.length
    ? Math.round((correctCount / activeTrack.questions.length) * 100)
    : null;

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const stopAudio = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentLineIndex(null);
  };

  const speakFrom = (lineIndex: number) => {
    if (!("speechSynthesis" in window)) return;
    const line = activeTrack.lines[lineIndex];
    if (!line) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentLineIndex(lineIndex);
    setIsPlaying(true);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(line.text_de);
    const germanVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("de"));

    if (germanVoice) utterance.voice = germanVoice;
    utterance.lang = "de-DE";
    utterance.rate = speed === "slow" ? 0.72 : 0.95;
    utterance.pitch = 1;
    utterance.onend = () => speakFrom(lineIndex + 1);
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const selectTrack = (trackId: string) => {
    stopAudio();
    setAnswers({});
    setShowResults(false);
    setShowTranscript(false);
    setActiveTrackId(trackId);
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    speakFrom(currentLineIndex ?? 0);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleSpeedChange = (nextSpeed: PlaybackSpeed) => {
    setSpeed(nextSpeed);
    if (isPlaying || isPaused) {
      const restartIndex = currentLineIndex ?? 0;
      stopAudio();
      setTimeout(() => speakFrom(restartIndex), 0);
    }
  };

  const answerQuestion = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Аудирование</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Диалоги, транскрипт и проверка понимания</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Headphones className="h-3.5 w-3.5" />
          <span>{TRACKS.length} диалога</span>
        </div>
      </div>

      <div className="grid gap-2">
        {TRACKS.map((track) => {
          const active = track.id === activeTrack.id;
          return (
            <button
              key={track.id}
              onClick={() => selectTrack(track.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                active ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Volume2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{track.title}</p>
                  <Badge variant={track.cefr_level.toLowerCase() as "a2" | "b1"}>{track.cefr_level}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{track.topic}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {track.durationMin} мин
                  </span>
                </div>
              </div>
              <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground/40", active && "text-primary")} />
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={activeTrack.cefr_level.toLowerCase() as "a2" | "b1"}>{activeTrack.cefr_level}</Badge>
              <Badge variant="muted">{activeTrack.topic}</Badge>
            </div>
            <h2 className="mt-2 text-lg font-bold">{activeTrack.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{activeTrack.goal}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={stopAudio} disabled={!isPlaying && !isPaused}>
            <Square className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeTrack.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {keyword}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 h-12" onClick={isPlaying ? handlePause : handlePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Пауза" : isPaused ? "Продолжить" : "Слушать"}
          </Button>
          <Button variant="outline" className="h-12 px-4" onClick={() => speakFrom(0)}>
            <RotateCcw className="h-4 w-4" />
            Сначала
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {([
            { value: "normal", label: "Нормально", sub: "0.95x" },
            { value: "slow", label: "Медленно", sub: "0.72x" },
          ] as const).map((option) => (
            <button
              key={option.value}
              onClick={() => handleSpeedChange(option.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm transition-all",
                speed === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">{option.label}</span>
              <span className="text-xs opacity-70">{option.sub}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-muted/50 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Прогресс диалога</span>
            <span>{currentLineIndex === null ? 0 : currentLineIndex + 1} / {activeTrack.lines.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${currentLineIndex === null ? 0 : ((currentLineIndex + 1) / activeTrack.lines.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <button
          onClick={() => setShowTranscript((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-2">
            {showTranscript ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm font-semibold">Транскрипт</span>
          </div>
          <span className="text-xs text-muted-foreground">{showTranscript ? "Скрыть" : "Показать"}</span>
        </button>

        {showTranscript && (
          <div className="space-y-2">
            {activeTrack.lines.map((line, index) => {
              const active = currentLineIndex === index;
              return (
                <button
                  key={`${line.speaker}-${index}`}
                  onClick={() => speakFrom(index)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    active ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">{line.speaker}</span>
                    {active && <Badge variant="default">сейчас</Badge>}
                  </div>
                  <p className="de-text text-sm leading-relaxed">{line.text_de}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{line.text_ru}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Проверка понимания</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {answeredCount} из {activeTrack.questions.length} ответов
            </p>
          </div>
          {score !== null && (
            <div className={cn(
              "rounded-full px-3 py-1.5 text-sm font-bold",
              score >= 80 ? "bg-success/10 text-success" : score >= 60 ? "bg-warning/10 text-warning" : "bg-again/10 text-again"
            )}>
              {score}%
            </div>
          )}
        </div>

        <div className="space-y-4">
          {activeTrack.questions.map((question, questionIndex) => {
            const selected = answers[questionIndex];
            const answered = selected !== undefined;
            const correct = selected === question.answer;

            return (
              <div key={question.question} className="space-y-2">
                <p className="text-sm font-medium">{questionIndex + 1}. {question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const selectedOption = selected === optionIndex;
                    const correctOption = question.answer === optionIndex;
                    return (
                      <button
                        key={option}
                        disabled={showResults}
                        onClick={() => answerQuestion(questionIndex, optionIndex)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all",
                          !showResults && selectedOption && "border-primary bg-primary/10 text-primary",
                          !showResults && !selectedOption && "border-border hover:bg-muted",
                          showResults && correctOption && "border-success bg-success/10 text-success",
                          showResults && selectedOption && !correctOption && "border-again bg-again/10 text-again",
                          showResults && !selectedOption && !correctOption && "border-border opacity-60"
                        )}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
                {showResults && answered && (
                  <div className={cn(
                    "flex gap-2 rounded-xl p-3 text-xs",
                    correct ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {correct ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                    <p>{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setAnswers({});
              setShowResults(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Сбросить
          </Button>
          <Button
            disabled={answeredCount < activeTrack.questions.length}
            onClick={() => setShowResults(true)}
          >
            Проверить
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

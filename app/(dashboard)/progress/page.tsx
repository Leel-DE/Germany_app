"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Trophy, Target, Flame, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const weeklyData = [
  { day: "Пн", words: 12, minutes: 25 },
  { day: "Вт", words: 8, minutes: 18 },
  { day: "Ср", words: 15, minutes: 32 },
  { day: "Чт", words: 0, minutes: 0 },
  { day: "Пт", words: 11, minutes: 22 },
  { day: "Сб", words: 18, minutes: 35 },
  { day: "Вс", words: 9, minutes: 20 },
];

const accuracyData = [
  { week: "Нед 1", accuracy: 68 },
  { week: "Нед 2", accuracy: 72 },
  { week: "Нед 3", accuracy: 79 },
  { week: "Нед 4", accuracy: 84 },
];

const grammarProgress = [
  { topic: "Nominativ", score: 95, status: "completed" },
  { topic: "Akkusativ", score: 58, status: "needs_review" },
  { topic: "Dativ", score: 72, status: "in_progress" },
  { topic: "Perfekt", score: 63, status: "needs_review" },
  { topic: "Modalverben", score: 88, status: "completed" },
  { topic: "Nebensätze", score: 0, status: "not_started" },
];

const STATUS_COLOR: Record<string, string> = {
  completed: "bg-success",
  needs_review: "bg-warning",
  in_progress: "bg-primary",
  not_started: "bg-muted",
};

export default function ProgressPage() {
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Прогресс</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Твоя статистика обучения</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: BookOpen, label: "Слов выучено", value: "847", sub: "из 1500 для B1", color: "text-primary", bg: "bg-primary/10" },
          { icon: Flame, label: "Серия дней", value: "7", sub: "рекорд: 14 дней", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
          { icon: Target, label: "Точность", value: "84%", sub: "за 7 дней", color: "text-success", bg: "bg-success/10" },
          { icon: Trophy, label: "Дней учёбы", value: "34", sub: "всего", color: "text-secondary", bg: "bg-secondary/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2.5", stat.bg)}>
              <stat.icon className={cn("w-4.5 h-4.5", stat.color)} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Level progress */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">Прогресс к B1</p>
          <div className="flex items-center gap-1 text-primary text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>56%</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Словарь", current: 847, target: 1500, color: "bg-primary" },
            { label: "Грамматика", current: 5, target: 21, color: "bg-secondary" },
            { label: "Письмо (работ)", current: 3, target: 20, color: "bg-good" },
          ].map((item) => {
            const pct = Math.round((item.current / item.target) * 100);
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.current} / {item.target}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs text-muted-foreground">⏱ Прогноз достижения B1</p>
          <p className="text-base font-bold text-primary mt-0.5">~4 месяца</p>
          <p className="text-xs text-muted-foreground">при занятиях 30 мин/день</p>
        </div>
      </div>

      {/* Weekly words chart */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="font-semibold text-sm">Слова за неделю</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: 12 }}
              formatter={(value) => [`${value} слов`, ""]}
            />
            <Bar dataKey="words" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy trend */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="font-semibold text-sm">Точность по неделям</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: 12 }}
              formatter={(value) => [`${value}%`, "Точность"]}
            />
            <Line type="monotone" dataKey="accuracy" stroke="var(--success)" strokeWidth={2.5} dot={{ fill: "var(--success)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grammar topics */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="font-semibold text-sm">Прогресс по грамматике</p>
        <div className="space-y-2.5">
          {grammarProgress.map((item) => (
            <div key={item.topic}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{item.topic}</span>
                <span className={cn(
                  "font-semibold",
                  item.status === "completed" ? "text-success" :
                  item.status === "needs_review" ? "text-warning" :
                  item.status === "in_progress" ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.status === "not_started" ? "—" : `${item.score}%`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", STATUS_COLOR[item.status])}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar heatmap (simplified) */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Активность за месяц</p>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => {
            const intensity = [0, 1, 2, 3, 2, 0, 1, 2, 3, 2, 1, 0, 3, 2, 1, 3, 2, 1, 0, 2, 3, 2, 1, 2, 3, 0, 1, 2][i] ?? 0;
            return (
              <div
                key={i}
                className={cn(
                  "h-7 rounded-md transition-colors",
                  intensity === 0 ? "bg-muted" :
                  intensity === 1 ? "bg-primary/20" :
                  intensity === 2 ? "bg-primary/50" :
                  "bg-primary"
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Меньше</span>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={cn("w-3 h-3 rounded-sm", i === 0 ? "bg-muted" : i === 1 ? "bg-primary/20" : i === 2 ? "bg-primary/50" : "bg-primary")} />
          ))}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}

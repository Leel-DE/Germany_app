"use client";
import { useState } from "react";
import { Sun, Moon, Monitor, Target, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light"|"dark"|"system">("system");
  const [dailyGoal, setDailyGoal] = useState(10);
  const [studyTime, setStudyTime] = useState(30);

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <h1 className="text-xl font-bold">Настройки</h1>

      {/* Theme */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="font-semibold text-sm">Тема оформления</p>
        <div className="flex gap-2">
          {([
            { value: "light", icon: Sun, label: "Светлая" },
            { value: "dark", icon: Moon, label: "Тёмная" },
            { value: "system", icon: Monitor, label: "Авто" },
          ] as const).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm transition-all",
                theme === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <p className="font-semibold text-sm">Цели обучения</p>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Новых слов в день</span>
            </div>
            <span className="font-bold text-primary">{dailyGoal}</span>
          </div>
          <input type="range" min={5} max={20} value={dailyGoal} onChange={e => setDailyGoal(+e.target.value)}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>5</span><span>20</span></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Минут занятий в день</span>
            </div>
            <span className="font-bold text-primary">{studyTime}</span>
          </div>
          <input type="range" min={10} max={60} step={5} value={studyTime} onChange={e => setStudyTime(+e.target.value)}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>10</span><span>60</span></div>
        </div>
      </div>

      {/* Level */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="font-semibold text-sm">Текущий уровень</p>
        <div className="grid grid-cols-4 gap-2">
          {["A1","A2","B1","B2"].map(level => (
            <button key={level} className={cn(
              "py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
              level === "A2" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            )}>{level}</button>
          ))}
        </div>
      </div>

      {/* Supabase setup hint */}
      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
        <p className="text-xs font-semibold text-warning mb-1.5">⚙️ Для полной работы приложения</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Добавьте ключи в <code className="bg-muted px-1 py-0.5 rounded text-xs">.env.local</code>:<br />
          • <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code><br />
          • <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code><br />
          • <code className="text-xs">AI_PROVIDER</code> = <code className="text-xs">gemini</code>, <code className="text-xs">openai</code> или <code className="text-xs">anthropic</code><br />
          • <code className="text-xs">GEMINI_API_KEY</code>, <code className="text-xs">OPENAI_API_KEY</code> или <code className="text-xs">ANTHROPIC_API_KEY</code>
        </p>
      </div>

      <Button className="w-full">Сохранить настройки</Button>
    </div>
  );
}

import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TestsPage() {
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Тесты</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Проверь свои знания</p>
      </div>
      <div className="space-y-2">
        {[
          { title: "Тест на уровень A2/B1", desc: "40 вопросов · ~20 мин", level: "A2", ready: false },
          { title: "Грамматика: Падежи", desc: "20 вопросов · ~10 мин", level: "A2", ready: false },
          { title: "Словарный запас B1", desc: "30 вопросов · ~15 мин", level: "B1", ready: false },
        ].map((test) => (
          <div key={test.title} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{test.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={test.level.toLowerCase() as "a2"|"b1"}>{test.level}</Badge>
                <span className="text-xs text-muted-foreground">{test.desc}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" disabled>Скоро</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

import { BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TEXTS = [
  { id: "1", title: "Im Supermarkt", level: "A2", topic: "Alltag", readTime: 3 },
  { id: "2", title: "Meine Wohnung", level: "A2", topic: "Wohnung", readTime: 4 },
  { id: "3", title: "Beim Arzt", level: "B1", topic: "Gesundheit", readTime: 5 },
  { id: "4", title: "Auf Jobsuche", level: "B1", topic: "Arbeit", readTime: 6 },
];

export default function ReadingPage() {
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Чтение</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Короткие тексты с подсветкой слов</p>
      </div>
      <div className="space-y-2">
        {TEXTS.map((text) => (
          <div key={text.id} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{text.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={text.level.toLowerCase() as "a2"|"b1"}>{text.level}</Badge>
                <span className="text-xs text-muted-foreground">{text.topic}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />{text.readTime} мин
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
        <p className="text-sm">Больше текстов скоро появятся</p>
      </div>
    </div>
  );
}

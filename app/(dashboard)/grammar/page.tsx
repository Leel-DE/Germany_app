import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GRAMMAR_TOPICS, GRAMMAR_CATEGORIES } from "@/lib/data/grammarTopics";
import { cn } from "@/lib/utils";

// Demo completion state
const COMPLETED = ["nominativ", "modalverben"];
const IN_PROGRESS = ["akkusativ"];

export default function GrammarPage() {
  const grouped = GRAMMAR_TOPICS.reduce<Record<string, typeof GRAMMAR_TOPICS>>((acc, topic) => {
    const cat = topic.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(topic);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Грамматика</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {COMPLETED.length} из {GRAMMAR_TOPICS.length} тем пройдено
        </p>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Общий прогресс</span>
          <span className="text-muted-foreground">{Math.round((COMPLETED.length / GRAMMAR_TOPICS.length) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all"
            style={{ width: `${(COMPLETED.length / GRAMMAR_TOPICS.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>✅ {COMPLETED.length} пройдено</span>
          <span>🔄 {IN_PROGRESS.length} в процессе</span>
          <span>⭕ {GRAMMAR_TOPICS.length - COMPLETED.length - IN_PROGRESS.length} не начато</span>
        </div>
      </div>

      {/* Topics by category */}
      {Object.entries(grouped).map(([category, topics]) => (
        <div key={category} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {GRAMMAR_CATEGORIES[category] ?? category}
          </h2>
          <div className="space-y-1.5">
            {topics.map((topic) => {
              const done = COMPLETED.includes(topic.slug);
              const active = IN_PROGRESS.includes(topic.slug);
              return (
                <Link key={topic.slug} href={`/grammar/${topic.slug}`}>
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-sm active:scale-[0.99]",
                    done ? "border-success/20 bg-success/5" : active ? "border-primary/20 bg-primary/5" : "border-border bg-card"
                  )}>
                    <div className="shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : active ? (
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{topic.title_de}</span>
                        <Badge
                          variant={topic.cefr_level.toLowerCase() as "a1"|"a2"|"b1"|"b2"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {topic.cefr_level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{topic.title_ru}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

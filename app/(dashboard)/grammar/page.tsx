import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { grammarTopicsColl, userGrammarProgressColl } from "@/lib/models/collections";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

const CATEGORY_LABELS: Record<string, string> = {
  cases: "Cases",
  verbs: "Verbs",
  sentences: "Sentences",
  prepositions: "Prepositions",
  adjectives: "Adjectives",
  "word-order": "Word order",
};

export default async function GrammarPage() {
  const t = await getTranslations("grammar");
  const user = await getCurrentUser();
  if (!user) return null;

  const topics = await (await grammarTopicsColl()).find({ isPublished: true }).sort({ order_index: 1 }).toArray();
  const progressRows = await (await userGrammarProgressColl())
    .find({ userId: user._id, topicId: { $in: topics.map((topic) => topic._id) } })
    .toArray();
  const progress = new Map(progressRows.map((row) => [row.topicId.toString(), row.status]));
  const completed = progressRows.filter((row) => row.status === "completed").length;

  const grouped = topics.reduce<Record<string, typeof topics>>((acc, topic) => {
    acc[topic.category] ??= [];
    acc[topic.category].push(topic);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("lessonsCompleted", { completed, total: topics.length })}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{t("overallProgress")}</span>
          <span className="text-muted-foreground">{topics.length ? Math.round((completed / topics.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-secondary" style={{ width: `${topics.length ? (completed / topics.length) * 100 : 0}%` }} />
        </div>
      </div>

      {Object.entries(grouped).map(([category, rows]) => (
        <section key={category} className="space-y-2">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <div className="space-y-1.5">
            {rows.map((topic) => {
              const status = progress.get(topic._id.toString()) ?? "not_started";
              const done = status === "completed";
              const active = status === "in_progress";
              return (
                <Link key={topic.slug} href={`/grammar/${topic.slug}`}>
                  <div className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-sm",
                    done ? "border-success/20 bg-success/5" : active ? "border-primary/20 bg-primary/5" : "border-border bg-card"
                  )}>
                    {done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{topic.title_de}</span>
                        <Badge variant={topic.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{topic.cefr_level}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{topic.title_ru}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

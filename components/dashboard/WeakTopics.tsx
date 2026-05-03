import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

interface WeakTopic {
  slug: string;
  title: string;
  score: number;
}

interface WeakTopicsProps {
  topics: WeakTopic[];
}

export function WeakTopics({ topics }: WeakTopicsProps) {
  if (topics.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <p className="font-semibold text-sm">Слабые темы — поработай над ними</p>
      </div>
      <ul className="space-y-3">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/grammar/${topic.slug}`} className="block group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{topic.title}</span>
                <span className="text-xs font-semibold text-warning">{topic.score}%</span>
              </div>
              <Progress value={topic.score} className="h-1.5 [&>div]:bg-warning" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

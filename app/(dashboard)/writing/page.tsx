"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WritingTemplate } from "@/types";
import { useTranslations } from "next-intl";

export default function WritingPage() {
  const t = useTranslations("writing");
  const [tasks, setTasks] = useState<WritingTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/writing/tasks", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("subtitle")}</p>
      </div>

      {loading && <State><Loader2 className="h-6 w-6 animate-spin" /></State>}
      {!loading && tasks.length === 0 && <State><FileText className="h-6 w-6" />{t("noTasks")}</State>}

      <div className="space-y-2">
        {tasks.map((task) => (
          <Link key={task.id} href={`/writing/${task.id}`}>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant={task.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{task.cefr_level}</Badge>
                  <Badge variant="muted">{task.topic}</Badge>
                  <Badge variant="outline" className="capitalize">{task.type}</Badge>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[30vh] place-items-center gap-2 text-center text-sm text-muted-foreground">{children}</div>;
}

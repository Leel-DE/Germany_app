"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadingTextView } from "@/components/reading/ReadingTextView";
import { ReadingQuiz } from "@/components/reading/ReadingQuiz";
import type { ReadingText } from "@/types";
import { useTranslations } from "next-intl";

export default function ReadingDetailPage() {
  const t = useTranslations("reading");
  const loadSingleErrorText = t("loadSingleError");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [text, setText] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/reading/texts/${params.id}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? loadSingleErrorText);
        return data as { text?: ReadingText };
      })
      .then((data) => {
        if (!cancelled) setText(data.text ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : loadSingleErrorText);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadSingleErrorText, params.id]);

  if (loading) return <State><Loader2 className="h-6 w-6 animate-spin" />{t("loadingText")}</State>;
  if (error) return <State>{error}</State>;
  if (!text) return <State>{t("textNotFound")}</State>;

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/reading")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-tight">{text.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={text.cefr_level.toLowerCase() as "a1" | "a2" | "b1" | "b2"}>{text.cefr_level}</Badge>
            <Badge variant="muted">{text.topic}</Badge>
            {text.read_time_min && <Badge variant="outline">{text.read_time_min} {t("min")}</Badge>}
            {text.word_count && <Badge variant="outline">{text.word_count} {t("words")}</Badge>}
          </div>
        </div>
      </div>

      <ReadingTextView text={text} />
      <ReadingQuiz textId={text.id} questions={text.questions ?? []} />
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[50vh] place-items-center gap-2 text-center text-sm text-muted-foreground">
      <BookOpen className="h-6 w-6" />
      <div>{children}</div>
    </div>
  );
}

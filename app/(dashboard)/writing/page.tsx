import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WRITING_TEMPLATES } from "@/lib/data/writingTemplates";

const TOPIC_EMOJI: Record<string, string> = {
  Wohnung: "🏠", Behörden: "🏛️", Arbeit: "💼", Gesundheit: "🏥",
  Alltag: "🛒", Reisen: "✈️",
};

export default function WritingPage() {
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Письмо</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Практика письменного немецкого с AI-проверкой
        </p>
      </div>

      <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
        <p className="text-sm font-semibold text-secondary mb-1">🤖 AI-проверка писем</p>
        <p className="text-xs text-muted-foreground">Напишите письмо — AI найдёт ошибки, объяснит их на русском и предложит улучшения</p>
      </div>

      <div className="space-y-2">
        {WRITING_TEMPLATES.map((template) => (
          <Link key={template.id} href={`/writing/${template.id}`}>
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-sm transition-all active:scale-[0.99]">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                {TOPIC_EMOJI[template.topic] ?? "📝"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-snug">{template.title}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge variant={template.cefr_level.toLowerCase() as "b1"|"b2"}>{template.cefr_level}</Badge>
                  <Badge variant="muted">{template.topic}</Badge>
                  <Badge variant="outline" className="capitalize">{template.type}</Badge>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 text-center">
        <FileText className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium">Мои письма</p>
        <p className="text-xs text-muted-foreground mt-0.5">История проверенных писем появится здесь</p>
      </div>
    </div>
  );
}

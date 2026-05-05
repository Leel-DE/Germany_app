import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function TestsPage() {
  const t = await getTranslations("tests");
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t("subtitle")}</p>
      </div>
      <div className="space-y-2">
        {[
          { title: t("levelTestTitle"), desc: t("levelTestDesc"), level: "A2", ready: false },
          { title: t("casesTestTitle"), desc: t("casesTestDesc"), level: "A2", ready: false },
          { title: t("vocabTestTitle"), desc: t("vocabTestDesc"), level: "B1", ready: false },
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
            <Button size="sm" variant="outline" disabled>{t("soon")}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

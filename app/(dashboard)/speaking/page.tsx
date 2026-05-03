import { Mic } from "lucide-react";

const SCENARIOS = [
  "🏥 Arzttermin — у врача",
  "🏛️ Jobcenter — в службе занятости",
  "💼 Vorstellungsgespräch — собеседование",
  "🏠 Wohnung mieten — снять квартиру",
  "📞 Telefonat — телефонный разговор",
  "🛒 Einkauf — в магазине",
];

export default function SpeakingPage() {
  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">Разговор</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Сценарии для жизни в Германии</p>
      </div>
      <div className="space-y-2">
        {SCENARIOS.map((s) => (
          <div key={s} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card opacity-60">
            <span className="text-base">{s.split(" ")[0]}</span>
            <span className="text-sm">{s.split(" ").slice(1).join(" ")}</span>
            <span className="ml-auto text-xs text-muted-foreground">Скоро</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center gap-3">
        <Mic className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Диалоги, shadowing и сценарии из реальной жизни появятся в следующем обновлении</p>
      </div>
    </div>
  );
}

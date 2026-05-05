import type { ReadingTextDoc } from "@/lib/models/types";

type Seed = Omit<ReadingTextDoc, "_id" | "isSystem" | "createdAt" | "createdBy">;

export const SEED_READING_TEXTS: Seed[] = [
  {
    title: "Ein Termin beim Bürgeramt",
    cefr_level: "A2",
    topic: "Dokumente",
    content:
      "Morgen hat Karim einen Termin beim Bürgeramt. Er braucht eine Meldebescheinigung für seine neue Wohnung. Am Abend legt er alle Dokumente auf den Tisch: seinen Pass, den Mietvertrag und die Terminbestätigung. Er kontrolliert die Adresse noch einmal, weil das Bürgeramt in einem anderen Stadtteil ist. Am nächsten Morgen fährt er mit der U-Bahn los. Im Bürgeramt zieht er eine Nummer und wartet zwanzig Minuten. Die Mitarbeiterin ist freundlich. Sie fragt nach seinem Ausweis und nach dem Mietvertrag. Karim versteht nicht jedes Wort, aber er fragt ruhig nach: Können Sie das bitte wiederholen? Nach zehn Minuten bekommt er die Bescheinigung. Er ist erleichtert, denn jetzt kann er auch sein Bankkonto eröffnen.",
    word_count: 124,
    read_time_min: 2,
    questions: [
      {
        question: "Warum geht Karim zum Bürgeramt?",
        options: ["Er braucht eine Meldebescheinigung.", "Er sucht eine neue Wohnung.", "Er möchte Deutsch lernen.", "Er will einen Pass beantragen."],
        answer: 0,
        explanation: "Im Text steht, dass Karim eine Meldebescheinigung für seine neue Wohnung braucht.",
      },
      {
        question: "Welche Dokumente nimmt Karim mit?",
        options: ["Pass, Mietvertrag und Terminbestätigung", "Führerschein und Zeugnis", "Arbeitsvertrag und Foto", "Nur seinen Pass"],
        answer: 0,
        explanation: "Er legt Pass, Mietvertrag und Terminbestätigung auf den Tisch.",
      },
      {
        question: "Was macht Karim, wenn er etwas nicht versteht?",
        options: ["Er geht nach Hause.", "Er fragt ruhig nach.", "Er ruft seinen Freund an.", "Er sagt nichts."],
        answer: 1,
        explanation: "Karim fragt: Können Sie das bitte wiederholen?",
      },
    ],
  },
  {
    title: "Ein Gespräch im Team",
    cefr_level: "B1",
    topic: "Arbeit",
    content:
      "Lea arbeitet seit drei Monaten in einem kleinen IT-Team. Jeden Montag gibt es ein kurzes Meeting. Heute soll sie erklären, warum eine Aufgabe länger dauert als geplant. Am Anfang ist sie nervös, aber sie hat sich gut vorbereitet. Sie zeigt eine Liste mit den offenen Punkten und erklärt, welche Informationen noch fehlen. Ihr Kollege Max schlägt vor, die Aufgabe in zwei kleinere Teile zu teilen. Die Teamleiterin findet die Idee gut und fragt Lea, ob sie bis Freitag den ersten Teil schaffen kann. Lea antwortet ehrlich: Wenn ich heute die fehlenden Daten bekomme, ist Freitag realistisch. Nach dem Meeting fühlt sie sich sicherer, weil sie klar kommuniziert hat und das Team eine Lösung gefunden hat.",
    word_count: 118,
    read_time_min: 2,
    questions: [
      {
        question: "Warum ist Lea am Anfang nervös?",
        options: ["Sie muss erklären, warum eine Aufgabe länger dauert.", "Sie kommt zu spät.", "Sie hat ihre Liste verloren.", "Sie kennt Max nicht."],
        answer: 0,
        explanation: "Sie soll im Meeting erklären, warum eine Aufgabe länger dauert als geplant.",
      },
      {
        question: "Was schlägt Max vor?",
        options: ["Die Aufgabe zu löschen", "Die Aufgabe in zwei kleinere Teile zu teilen", "Bis Montag zu warten", "Eine andere Stelle zu suchen"],
        answer: 1,
        explanation: "Max schlägt vor, die Aufgabe in zwei kleinere Teile zu teilen.",
      },
      {
        question: "Unter welcher Bedingung ist Freitag realistisch?",
        options: ["Wenn Lea Urlaub nimmt", "Wenn Max alles allein macht", "Wenn Lea heute die fehlenden Daten bekommt", "Wenn das Meeting ausfällt"],
        answer: 2,
        explanation: "Lea sagt: Wenn ich heute die fehlenden Daten bekomme, ist Freitag realistisch.",
      },
    ],
  },
  {
    title: "Beim Arzt: Ein neues Rezept",
    cefr_level: "B1",
    topic: "Gesundheit",
    content:
      "Seit einigen Tagen hat Elena starke Halsschmerzen. Sie trinkt Tee und bleibt zu Hause, aber es wird nicht besser. Deshalb ruft sie in der Praxis an und bekommt einen Termin am Nachmittag. Im Wartezimmer füllt sie ein Formular aus. Der Arzt fragt, ob sie Fieber hat und ob sie Medikamente nimmt. Elena erklärt, dass sie nur Kopfschmerztabletten genommen hat. Der Arzt untersucht ihren Hals und sagt, dass sie eine Entzündung hat. Er schreibt ein Rezept und erklärt genau, wie Elena das Medikament nehmen soll: zweimal täglich nach dem Essen. Außerdem soll sie viel trinken und sich zwei Tage ausruhen. Elena ist froh, weil sie jetzt weiß, was sie tun muss.",
    word_count: 115,
    read_time_min: 2,
    questions: [
      {
        question: "Warum ruft Elena in der Praxis an?",
        options: ["Sie hat starke Halsschmerzen.", "Sie möchte dort arbeiten.", "Sie sucht eine Apotheke.", "Sie braucht eine Versicherung."],
        answer: 0,
        explanation: "Elena hat seit einigen Tagen starke Halsschmerzen.",
      },
      {
        question: "Was fragt der Arzt?",
        options: ["Ob sie Fieber hat und Medikamente nimmt", "Ob sie umziehen möchte", "Ob sie Deutsch lernt", "Ob sie eine Rechnung bezahlt hat"],
        answer: 0,
        explanation: "Der Arzt fragt nach Fieber und Medikamenten.",
      },
      {
        question: "Wie soll Elena das Medikament nehmen?",
        options: ["Einmal morgens", "Zweimal täglich nach dem Essen", "Nur vor dem Schlafen", "Alle zwei Stunden"],
        answer: 1,
        explanation: "Im Text steht: zweimal täglich nach dem Essen.",
      },
    ],
  },
];

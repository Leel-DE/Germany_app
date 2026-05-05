import type { WritingTaskDoc } from "@/lib/models/types";
import { WRITING_TEMPLATES as MOCK_WRITING } from "@/lib/data/writingTemplates";

type Seed = Omit<WritingTaskDoc, "_id">;

const FROM_MOCK: Seed[] = MOCK_WRITING.map((t) => ({
  title: t.title,
  type: t.type,
  topic: t.topic,
  cefr_level: t.cefr_level,
  prompt: t.prompt,
  structure: t.structure,
  example: t.example,
  key_phrases: t.key_phrases,
}));

const ADDITIONAL: Seed[] = [
  {
    title: "Жалоба на покупку (Reklamation)", type: "formal", topic: "Einkaufen", cefr_level: "B1",
    prompt: "Ты купил товар, который оказался бракованным. Напиши формальное письмо в компанию: опиши проблему, попроси замену или возврат денег.",
    key_phrases: [
      "Mit Bedauern muss ich Ihnen mitteilen, dass...",
      "Ich habe am ... bei Ihnen ... gekauft.",
      "Leider ist ... defekt.",
      "Ich bitte um Umtausch / Rückerstattung.",
      "Ich erwarte Ihre baldige Antwort.",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Sehr geehrte Damen und Herren,", tip: "Стандартная формальная форма" },
      { name: "Einleitung", example: "ich wende mich an Sie mit einer Reklamation.", tip: "Сразу обозначь жалобу" },
      { name: "Sachverhalt", example: "Am 1. April habe ich bei Ihnen einen Wasserkocher gekauft. Leider funktioniert er nicht.", tip: "Дата + товар + проблема" },
      { name: "Forderung", example: "Ich bitte Sie um einen Umtausch oder die Rückerstattung des Kaufpreises.", tip: "Чёткая просьба" },
      { name: "Schluss", example: "Ich erwarte Ihre baldige Antwort.", tip: "Деликатное давление" },
      { name: "Grußformel", example: "Mit freundlichen Grüßen", tip: "Без вариантов" },
    ]},
    example: `Sehr geehrte Damen und Herren,\n\nich wende mich an Sie mit einer Reklamation.\n\nAm 1. April habe ich bei Ihnen einen Wasserkocher (Modell XY) gekauft. Leider funktioniert das Gerät seit dem ersten Gebrauch nicht: das Wasser wird nicht heiß. Den Kassenbon habe ich beigelegt.\n\nIch bitte Sie um einen Umtausch oder die Rückerstattung des Kaufpreises (39,99 €).\n\nFür eine baldige Antwort wäre ich dankbar.\n\nMit freundlichen Grüßen,\nArtur Beispiel`,
  },
  {
    title: "Извинение за пропуск работы (Entschuldigung)", type: "formal", topic: "Arbeit", cefr_level: "B1",
    prompt: "Ты пропустил рабочий день из-за болезни. Напиши коллеге или начальнику короткое извинение и объясни ситуацию.",
    key_phrases: [
      "Es tut mir leid, dass...",
      "Ich war krank und konnte nicht zur Arbeit kommen.",
      "Eine Krankschreibung füge ich bei.",
      "Ich werde die Arbeit nachholen.",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Sehr geehrter Herr Müller,", tip: "Если знаешь имя — используй его" },
      { name: "Entschuldigung", example: "es tut mir leid, dass ich gestern nicht zur Arbeit kommen konnte.", tip: "Сразу извинись" },
      { name: "Grund", example: "Ich war krank und musste zum Arzt.", tip: "Кратко объясни" },
      { name: "Nachweis", example: "Eine Krankschreibung füge ich bei.", tip: "Приложи документ" },
      { name: "Schluss", example: "Ich werde die ausgefallene Arbeit so bald wie möglich nachholen.", tip: "Покажи ответственность" },
      { name: "Grußformel", example: "Mit freundlichen Grüßen", tip: "" },
    ]},
    example: `Sehr geehrter Herr Müller,\n\nes tut mir leid, dass ich gestern, am 28. April, nicht zur Arbeit kommen konnte. Ich war seit dem frühen Morgen krank und musste zum Arzt.\n\nEine Krankschreibung für gestern und heute füge ich diesem Schreiben bei.\n\nDie ausgefallene Arbeit werde ich so bald wie möglich nachholen. Falls etwas Dringendes ansteht, bin ich per E-Mail erreichbar.\n\nMit freundlichen Grüßen,\nArtur Beispiel`,
  },
  {
    title: "Просьба о Termin (Termin vereinbaren)", type: "formal", topic: "Behörden", cefr_level: "A2",
    prompt: "Напиши короткое письмо в Behörde с просьбой назначить встречу. Укажи свою цель и предпочитаемое время.",
    key_phrases: [
      "Ich möchte gerne einen Termin vereinbaren.",
      "Mein Anliegen ist...",
      "Wann hätten Sie einen Termin frei?",
      "Ich bin erreichbar unter...",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Sehr geehrte Damen und Herren,", tip: "" },
      { name: "Anliegen", example: "ich möchte gerne einen Termin vereinbaren, um meinen Wohnsitz anzumelden.", tip: "Сразу скажи что нужно" },
      { name: "Zeit", example: "Mir würden Vormittage am Dienstag oder Mittwoch passen.", tip: "Дай несколько вариантов" },
      { name: "Kontakt", example: "Sie erreichen mich unter 0176 12345678 oder per E-Mail.", tip: "Способ связи" },
      { name: "Grußformel", example: "Mit freundlichen Grüßen", tip: "" },
    ]},
    example: `Sehr geehrte Damen und Herren,\n\nich möchte gerne einen Termin im Bürgeramt vereinbaren, um meinen Wohnsitz anzumelden.\n\nMir würden die Vormittage am Dienstag oder Mittwoch zwischen 9 und 12 Uhr besonders gut passen. Ich bin aber zeitlich flexibel.\n\nSie erreichen mich telefonisch unter 0176 12345678 oder per E-Mail an artur@example.com.\n\nVielen Dank im Voraus für Ihre Mühe.\n\nMit freundlichen Grüßen,\nArtur Beispiel`,
  },
  {
    title: "Письмо другу о выходных (Brief an Freund)", type: "informal", topic: "Familie", cefr_level: "A2",
    prompt: "Напиши короткое неформальное письмо другу: расскажи как прошли выходные, что планируешь на следующие.",
    key_phrases: [
      "Hallo / Liebe(r)...!",
      "Wie geht's dir?",
      "Mir geht es gut, weil...",
      "Am Wochenende habe ich ...",
      "Ich freue mich, bald von dir zu hören.",
      "Liebe Grüße",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Hallo Anna!", tip: "Неформальная — Hallo / Liebe(r)" },
      { name: "Einleitung", example: "wie geht's dir? Bei mir alles gut.", tip: "Спроси о собеседнике" },
      { name: "Hauptteil", example: "Am Wochenende war ich im Park...", tip: "Расскажи о выходных" },
      { name: "Plan", example: "Nächstes Wochenende möchte ich...", tip: "Поделись планами" },
      { name: "Schluss", example: "Ich freue mich, bald von dir zu hören.", tip: "Заверши тёплой фразой" },
      { name: "Grußformel", example: "Liebe Grüße, Artur", tip: "Дружески" },
    ]},
    example: `Hallo Anna!\n\nwie geht's dir? Bei mir ist alles super.\n\nAm Wochenende war ich im Park mit meinen Freunden. Wir haben gegrillt und Frisbee gespielt. Es war richtig schön. Am Sonntag bin ich lange ausgeschlafen und habe einen Film geschaut.\n\nNächstes Wochenende möchte ich nach Berlin fahren. Hast du Lust mitzukommen?\n\nIch freue mich, bald von dir zu hören.\n\nLiebe Grüße,\nArtur`,
  },
  {
    title: "Письмо в Krankenkasse (смена врача)", type: "formal", topic: "Krankenkasse", cefr_level: "B1",
    prompt: "Сообщи Krankenkasse, что хочешь сменить семейного врача (Hausarzt). Укажи нового врача и дату начала.",
    key_phrases: [
      "Hiermit teile ich Ihnen mit, dass...",
      "Ab dem ... wechsle ich zu Dr. ...",
      "Ich bitte Sie um die Aktualisierung meiner Daten.",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Sehr geehrte Damen und Herren,", tip: "" },
      { name: "Mitteilung", example: "hiermit teile ich Ihnen mit, dass ich meinen Hausarzt wechsle.", tip: "Прямо к делу" },
      { name: "Details", example: "Ab dem 1. Mai 2026 ist Frau Dr. Schmidt meine neue Hausärztin.", tip: "Дата + имя врача" },
      { name: "Versicherungsnr", example: "Meine Versicherungsnummer: A123456789.", tip: "Всегда указывай номер" },
      { name: "Grußformel", example: "Mit freundlichen Grüßen", tip: "" },
    ]},
    example: `Sehr geehrte Damen und Herren,\n\nhiermit teile ich Ihnen mit, dass ich meinen Hausarzt wechsle.\n\nAb dem 1. Mai 2026 ist Frau Dr. med. Anna Schmidt (Hauptstraße 12, 10115 Berlin) meine neue Hausärztin.\n\nIch bitte Sie um die entsprechende Aktualisierung meiner Daten. Meine Versicherungsnummer lautet A123456789.\n\nVielen Dank für Ihre Bemühungen.\n\nMit freundlichen Grüßen,\nArtur Beispiel`,
  },
  {
    title: "Просьба отпустить с работы (Urlaubsantrag)", type: "formal", topic: "Arbeit", cefr_level: "B1",
    prompt: "Напиши короткое заявление руководителю о желании взять отпуск. Укажи даты и кто заменит.",
    key_phrases: [
      "Hiermit beantrage ich Urlaub vom ... bis zum ...",
      "Während meiner Abwesenheit übernimmt ... meine Aufgaben.",
      "Ich bitte um Ihre Bestätigung.",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Sehr geehrter Herr Schulz,", tip: "По имени" },
      { name: "Antrag", example: "hiermit beantrage ich Urlaub vom 1. bis 14. August.", tip: "Конкретные даты" },
      { name: "Vertretung", example: "Während meiner Abwesenheit übernimmt Frau Becker meine Aufgaben.", tip: "Кто заменит" },
      { name: "Schluss", example: "Ich bitte um Ihre Bestätigung.", tip: "Просьба о ответе" },
      { name: "Grußformel", example: "Mit freundlichen Grüßen", tip: "" },
    ]},
    example: `Sehr geehrter Herr Schulz,\n\nhiermit beantrage ich Urlaub vom 1. bis 14. August 2026 (insgesamt 10 Arbeitstage).\n\nWährend meiner Abwesenheit übernimmt meine Kollegin Frau Becker die laufenden Aufgaben. Wir haben dies bereits abgesprochen.\n\nIch bitte um Ihre Bestätigung.\n\nMit freundlichen Grüßen,\nArtur Beispiel`,
  },
  {
    title: "Письмо банку о потере карты", type: "formal", topic: "Finanzen", cefr_level: "B1",
    prompt: "Сообщи банку, что потерял банковскую карту, и попроси заблокировать и выпустить новую.",
    key_phrases: [
      "Hiermit melde ich Ihnen den Verlust meiner Karte.",
      "Ich bitte Sie, die Karte umgehend zu sperren.",
      "Ich beantrage eine Ersatzkarte.",
    ],
    structure: { parts: [
      { name: "Anrede", example: "Sehr geehrte Damen und Herren,", tip: "" },
      { name: "Verlustmeldung", example: "hiermit melde ich Ihnen den Verlust meiner Bankkarte.", tip: "Сразу к делу" },
      { name: "Bitte", example: "Ich bitte Sie, die Karte umgehend zu sperren und eine Ersatzkarte zuzusenden.", tip: "Две просьбы вместе" },
      { name: "Daten", example: "Kontonummer: DE89 ..., letzte 4 Ziffern: 1234.", tip: "Идентификация" },
      { name: "Grußformel", example: "Mit freundlichen Grüßen", tip: "" },
    ]},
    example: `Sehr geehrte Damen und Herren,\n\nhiermit melde ich Ihnen den Verlust meiner Bankkarte. Die letzten 4 Ziffern lauten 1234, meine Kontonummer ist DE89 1234 5678 9012 3456 78.\n\nIch bitte Sie, die Karte umgehend zu sperren und mir eine Ersatzkarte an meine Adresse zuzusenden.\n\nFür schnelle Bearbeitung wäre ich Ihnen sehr dankbar.\n\nMit freundlichen Grüßen,\nArtur Beispiel`,
  },
];

export const SEED_WRITING_TASKS: Seed[] = [...FROM_MOCK, ...ADDITIONAL];

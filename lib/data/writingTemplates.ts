import type { WritingTemplate } from "@/types";

export const WRITING_TEMPLATES: WritingTemplate[] = [
  {
    id: "1",
    title: "Письмо арендодателю о ремонте",
    type: "formal",
    topic: "Wohnung",
    cefr_level: "B1",
    prompt: "Напишите письмо арендодателю. В вашей квартире сломался отопительный котёл (Heizung). Опишите проблему, укажите дату начала, попросите прислать мастера. Упомяните, что это мешает вашему здоровью.",
    key_phrases: [
      "Ich wende mich an Sie bezüglich...",
      "Seit dem [Datum] funktioniert ... nicht mehr.",
      "Ich bitte Sie daher, so schnell wie möglich...",
      "Für eine baldige Antwort wäre ich Ihnen sehr dankbar.",
      "Mit freundlichen Grüßen"
    ],
    structure: {
      parts: [
        { name: "Anrede", example: "Sehr geehrte Frau/Herr [Name],", tip: "Всегда 'Sehr geehrte/r' в официальных письмах" },
        { name: "Einleitung", example: "ich wende mich an Sie bezüglich eines Problems in meiner Wohnung.", tip: "Сразу объясните цель письма" },
        { name: "Hauptteil", example: "Seit dem 28. April funktioniert die Heizung in meiner Wohnung nicht mehr. Die Temperatur ist auf unter 15 Grad gesunken.", tip: "Конкретные факты: когда, что, последствия" },
        { name: "Bitte", example: "Ich bitte Sie daher, so schnell wie möglich einen Techniker zu schicken.", tip: "Используйте 'Ich bitte Sie' для вежливой просьбы" },
        { name: "Schluss", example: "Für eine baldige Antwort wäre ich Ihnen sehr dankbar.", tip: "Поблагодарите и укажите ожидание ответа" },
        { name: "Grußformel", example: "Mit freundlichen Grüßen,\n[Ihr Name]", tip: "ВСЕГДА 'Mit freundlichen Grüßen' — не 'Liebe Grüße' в официальных письмах" }
      ]
    },
    example: `Sehr geehrte Frau Müller,

ich wende mich an Sie bezüglich eines Problems in meiner Wohnung in der Musterstraße 15.

Seit dem 28. April 2026 funktioniert die Heizung in meiner Wohnung nicht mehr. Die Temperatur in den Räumen ist auf unter 15 Grad gefallen. Ich habe bereits versucht, den Fehler selbst zu beheben, aber leider ohne Erfolg. Aufgrund der Kälte kann ich nicht schlafen und bin erkältet.

Ich bitte Sie daher, so schnell wie möglich einen Techniker zu schicken. Am besten würde es mir passen, wenn der Techniker an einem Werktag zwischen 9 und 17 Uhr kommen könnte. Ich bin telefonisch unter 0176 12345678 erreichbar.

Für eine schnelle Lösung dieses Problems wäre ich Ihnen sehr dankbar.

Mit freundlichen Grüßen,
Artur Beispiel`
  },
  {
    id: "2",
    title: "Письмо в Krankenkasse",
    type: "formal",
    topic: "Behörden",
    cefr_level: "B1",
    prompt: "Напишите в свою Krankenkasse. Вы сменили адрес и хотите сообщить об этом. Укажите новый адрес и попросите прислать новую карточку страхования (Versichertenkarte).",
    key_phrases: [
      "Hiermit möchte ich Ihnen mitteilen, dass...",
      "Meine neue Adresse lautet:",
      "Ich bitte Sie, mir eine neue Versichertenkarte zuzuschicken.",
      "Meine Versicherungsnummer lautet:",
      "Mit freundlichen Grüßen"
    ],
    structure: {
      parts: [
        { name: "Anrede", example: "Sehr geehrte Damen und Herren,", tip: "Если не знаете конкретного человека — используйте эту формулу" },
        { name: "Mitteilung", example: "hiermit möchte ich Ihnen mitteilen, dass ich umgezogen bin.", tip: "Чёткое сообщение о цели письма" },
        { name: "Neue Adresse", example: "Meine neue Adresse lautet:\n[Straße], [PLZ] [Stadt]", tip: "Адрес пишется на отдельной строке для ясности" },
        { name: "Bitte", example: "Ich bitte Sie, meine Daten zu aktualisieren und mir eine neue Versichertenkarte zuzuschicken.", tip: "Конкретная просьба о действии" },
        { name: "Grußformel", example: "Mit freundlichen Grüßen,\n[Ihr Name]\nVersicherungsnummer: [Nummer]", tip: "Укажите номер страховки — это ускорит обработку" }
      ]
    },
    example: `Sehr geehrte Damen und Herren,

hiermit möchte ich Ihnen mitteilen, dass ich am 1. Mai 2026 umgezogen bin.

Meine neue Adresse lautet:
Neue Straße 42
10115 Berlin

Ich bitte Sie, meine Daten entsprechend zu aktualisieren und mir eine neue Versichertenkarte an meine neue Adresse zuzuschicken.

Meine Versicherungsnummer lautet: A123456789.

Für Ihre Unterstützung bedanke ich mich im Voraus.

Mit freundlichen Grüßen,
Artur Beispiel`
  },
  {
    id: "3",
    title: "Заявление о приёме на работу (Bewerbung)",
    type: "application",
    topic: "Arbeit",
    cefr_level: "B1",
    prompt: "Напишите сопроводительное письмо (Anschreiben) для заявки на должность Verkäufer/in в супермаркете. Расскажите о своём опыте работы с клиентами, немецком языке и мотивации.",
    key_phrases: [
      "Hiermit bewerbe ich mich um die Stelle als...",
      "Ihre Stellenanzeige hat mich sehr angesprochen, weil...",
      "Ich habe Erfahrung in...",
      "Ich bin motiviert und lernbereit.",
      "Über eine Einladung zum Vorstellungsgespräch würde ich mich freuen."
    ],
    structure: {
      parts: [
        { name: "Anrede", example: "Sehr geehrte Damen und Herren,", tip: "Или по имени, если оно указано в объявлении" },
        { name: "Einleitung", example: "hiermit bewerbe ich mich um die Stelle als Verkäufer/in in Ihrem Unternehmen.", tip: "Сразу укажите должность" },
        { name: "Über mich", example: "Ich bin 28 Jahre alt und habe bereits zwei Jahre Erfahrung im Einzelhandel gesammelt.", tip: "Краткое описание себя и опыта" },
        { name: "Motivation", example: "Ich bewerbe mich bei Ihnen, weil ich gerne mit Menschen arbeite und Ihr Unternehmen einen guten Ruf hat.", tip: "Почему именно эта компания" },
        { name: "Schluss", example: "Über eine Einladung zum Vorstellungsgespräch würde ich mich sehr freuen.", tip: "Всегда заканчивайте с приглашением на собеседование" },
        { name: "Grußformel", example: "Mit freundlichen Grüßen,\n[Ihr Name]", tip: "Стандартное завершение" }
      ]
    },
    example: `Sehr geehrte Damen und Herren,

hiermit bewerbe ich mich um die Stelle als Verkäufer/in, die Sie auf der Internetseite ausgeschrieben haben.

Ich bin 28 Jahre alt und in Russland aufgewachsen. Seit zwei Jahren lebe ich in Berlin und lerne aktiv Deutsch. Ich habe bereits Erfahrung im Kundenservice und bin es gewohnt, freundlich und professionell mit Menschen zu kommunizieren.

Ich bewerbe mich bei Ihnen, weil ich gerne mit Menschen arbeite und mein Deutsch im Alltag verbessern möchte. Ich bin pünktlich, zuverlässig und lernbereit.

Meine Sprachkenntnisse: Deutsch B1, Englisch C1, Russisch (Muttersprache).

Über eine Einladung zum Vorstellungsgespräch würde ich mich sehr freuen. Für weitere Fragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Artur Beispiel`
  },
];

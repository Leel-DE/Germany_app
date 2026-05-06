import type { WritingTaskDoc } from "@/lib/models/types";

type Seed = Omit<WritingTaskDoc, "_id" | "createdAt" | "updatedAt">;

export const SEED_WRITING_TASKS: Seed[] = [
  // ─── A2 ──────────────────────────────────────────────────────────────────
  {
    title: "Письмо другу о выходных",
    type: "informal_message",
    topic: "Alltag",
    cefr_level: "A2",
    instructions:
      "Напишите короткое письмо другу. Расскажите, как прошли выходные: что вы делали, с кем были, понравилось ли. В конце спросите о его делах.",
    requirements: [
      "Поприветствуйте друга",
      "Расскажите о двух занятиях на выходных",
      "Используйте Perfekt минимум 3 раза",
      "Задайте другу хотя бы один вопрос",
      "Завершите дружеским прощанием",
    ],
    hints: [
      "Используйте обращение «Hallo» или «Liebe(r) ...»",
      "Не используйте формальные фразы вроде «Sehr geehrte»",
      "В конце «Liebe Grüße» или «Bis bald»",
    ],
    useful_phrases: [
      "Hallo Anna!",
      "Wie geht es dir?",
      "Am Samstag habe ich ...",
      "Am Sonntag war ich ...",
      "Es hat mir sehr gefallen.",
      "Was hast du am Wochenende gemacht?",
      "Liebe Grüße,",
    ],
    min_words: 60,
    estimated_minutes: 12,
    ideal_answer: `Hallo Anna!

Wie geht es dir? Bei mir ist alles gut. Am Samstag habe ich mit Tom Fußball gespielt. Danach sind wir ins Café gegangen und haben Kuchen gegessen. Am Sonntag war ich im Park und habe ein Buch gelesen. Das Wetter war schön.

Was hast du am Wochenende gemacht? Hast du Lust, am Freitag ins Kino zu gehen?

Liebe Grüße,
Artur`,
  },
  {
    title: "Запись к врачу (E-Mail an die Praxis)",
    type: "appointment",
    topic: "Arzt",
    cefr_level: "A2",
    instructions:
      "Напишите короткое письмо в кабинет врача и попросите назначить приём. Укажите свою фамилию, что у вас болит и когда вам удобно прийти.",
    requirements: [
      "Формальное приветствие",
      "Укажите цель письма (приём)",
      "Кратко опишите проблему со здоровьем",
      "Предложите 2 удобных времени",
      "Укажите телефон для связи",
    ],
    hints: [
      "Не нужно описывать симптомы подробно",
      "Используйте «Sie», не «du»",
      "В конце «Mit freundlichen Grüßen»",
    ],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "ich möchte einen Termin vereinbaren.",
      "Seit ... habe ich ...",
      "Mir würde ... passen.",
      "Sie erreichen mich unter ...",
      "Mit freundlichen Grüßen,",
    ],
    min_words: 70,
    estimated_minutes: 12,
    ideal_answer: `Sehr geehrte Damen und Herren,

mein Name ist Artur Beispiel. Ich möchte einen Termin in Ihrer Praxis vereinbaren. Seit drei Tagen habe ich starke Halsschmerzen und Fieber.

Mir würde ein Termin am Mittwoch- oder Donnerstagvormittag besonders gut passen. Ich bin aber zeitlich flexibel.

Sie erreichen mich telefonisch unter 0176 12345678 oder per E-Mail.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Сообщение коллеге (отпуск)",
    type: "informal_message",
    topic: "Arbeit",
    cefr_level: "A2",
    instructions:
      "Напишите короткое сообщение коллеге: вы будете в отпуске на следующей неделе и просите его взять на себя ваши задачи.",
    requirements: [
      "Объясните, когда у вас отпуск",
      "Назовите 2 задачи, которые нужно выполнить",
      "Поблагодарите коллегу",
      "Предложите помочь после возвращения",
    ],
    hints: [
      "Можно использовать «du», если коллега близкий",
      "Будьте конкретны с датами",
    ],
    useful_phrases: [
      "Hallo Max,",
      "ich bin nächste Woche im Urlaub.",
      "Könntest du bitte ...?",
      "Vielen Dank im Voraus!",
      "Liebe Grüße,",
    ],
    min_words: 60,
    estimated_minutes: 10,
    ideal_answer: `Hallo Max,

ich bin von Montag bis Freitag nächste Woche im Urlaub. Könntest du bitte in dieser Zeit zwei Aufgaben übernehmen? Erstens den Bericht für Frau Schulz fertigstellen, zweitens an dem Team-Meeting am Mittwoch teilnehmen.

Wenn du danach Hilfe bei deinen Aufgaben brauchst, helfe ich dir gerne.

Vielen Dank im Voraus!

Liebe Grüße,
Artur`,
  },
  {
    title: "Просьба о помощи (Bitte um Hilfe)",
    type: "request",
    topic: "Alltag",
    cefr_level: "A2",
    instructions:
      "Напишите соседу: вы уезжаете на 5 дней и просите его поливать цветы и забирать почту. Предложите благодарность.",
    requirements: [
      "Объясните ситуацию (отъезд)",
      "Сформулируйте две конкретные просьбы",
      "Предложите благодарность (подарок, услуга в ответ)",
      "Дайте контактные данные на случай вопросов",
    ],
    hints: [
      "Используйте «Könnten Sie ...?» — это вежливо",
      "Дайте точные даты",
    ],
    useful_phrases: [
      "Liebe Frau Schmidt,",
      "vom ... bis zum ... bin ich nicht zu Hause.",
      "Könnten Sie bitte ...?",
      "Als Dank ...",
      "Mit besten Grüßen,",
    ],
    min_words: 70,
    estimated_minutes: 12,
    ideal_answer: `Liebe Frau Schmidt,

vom 10. bis 15. Mai bin ich nicht zu Hause, weil ich meine Familie besuche. Könnten Sie bitte in dieser Zeit meine Blumen gießen und die Post aus dem Briefkasten nehmen? Den Schlüssel kann ich Ihnen morgen vorbeibringen.

Als Dank bringe ich Ihnen aus dem Urlaub gerne etwas mit. Bei Fragen erreichen Sie mich jederzeit unter 0176 12345678.

Vielen herzlichen Dank!

Mit besten Grüßen,
Artur Beispiel`,
  },
  {
    title: "Описание проблемы (Internet zu Hause)",
    type: "complaint",
    topic: "Alltag",
    cefr_level: "A2",
    instructions:
      "Напишите интернет-провайдеру: уже три дня дома не работает интернет. Опишите проблему и попросите прислать техника.",
    requirements: [
      "Назовите номер договора (Kundennummer)",
      "Опишите, что не работает и с какого момента",
      "Что вы уже пробовали (роутер, кабель)",
      "Попросите конкретное решение",
    ],
    hints: ["Будьте вежливы, но конкретны", "Дайте контакты"],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "seit dem ... funktioniert mein Internet nicht.",
      "Ich habe bereits den Router neu gestartet.",
      "Bitte schicken Sie einen Techniker.",
      "Mit freundlichen Grüßen,",
    ],
    min_words: 70,
    estimated_minutes: 12,
    ideal_answer: `Sehr geehrte Damen und Herren,

meine Kundennummer lautet 12345678. Seit dem 1. Mai funktioniert mein Internet zu Hause nicht mehr. Ich habe bereits den Router mehrmals neu gestartet und das Kabel überprüft, leider ohne Erfolg.

Bitte schicken Sie so schnell wie möglich einen Techniker. Werktags ab 14 Uhr bin ich zu Hause. Sie erreichen mich unter 0176 12345678.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },

  // ─── B1 ──────────────────────────────────────────────────────────────────
  {
    title: "Письмо арендодателю: не работает отопление",
    type: "complaint",
    topic: "Wohnung",
    cefr_level: "B1",
    instructions:
      "Напишите формальное письмо арендодателю. У вас не работает отопление. Попросите быстро решить проблему. Укажите, когда вы дома.",
    requirements: [
      "Формальное обращение и адрес квартиры",
      "Дата начала проблемы",
      "Объясните последствия (холодно, ребёнок, болезнь)",
      "Чёткая просьба о техническом мастере",
      "Укажите, когда вы дома и контактный телефон",
    ],
    hints: [
      "Не пишите эмоционально — формально и по делу",
      "Используйте «Mit freundlichen Grüßen»",
      "Не используйте сокращения",
    ],
    useful_phrases: [
      "Sehr geehrte Frau / Herr ...,",
      "ich wende mich an Sie bezüglich ...",
      "Seit dem ... funktioniert die Heizung nicht.",
      "Ich bitte Sie daher, ...",
      "Für eine baldige Antwort wäre ich dankbar.",
      "Mit freundlichen Grüßen,",
    ],
    min_words: 80,
    estimated_minutes: 15,
    ideal_answer: `Sehr geehrte Frau Müller,

ich wende mich an Sie bezüglich eines dringenden Problems in meiner Wohnung in der Musterstraße 15.

Seit dem 28. April 2026 funktioniert die Heizung in meiner Wohnung nicht mehr. Die Raumtemperatur ist auf unter 15 Grad gefallen. Ich habe bereits versucht, das Thermostat zurückzusetzen, leider ohne Erfolg. Mein Kind ist deshalb schon erkältet.

Ich bitte Sie daher, so schnell wie möglich einen Techniker zu schicken. Werktags zwischen 9 und 17 Uhr bin ich zu Hause oder per Telefon (0176 12345678) erreichbar.

Für eine baldige Antwort wäre ich Ihnen sehr dankbar.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Письмо в Krankenkasse: смена врача",
    type: "formal_email",
    topic: "Krankenkasse",
    cefr_level: "B1",
    instructions:
      "Сообщите больничной кассе, что хотите сменить семейного врача. Укажите нового врача, дату начала и попросите обновить данные.",
    requirements: [
      "Номер страхового полиса",
      "Имя и адрес нового врача",
      "Дата вступления в силу",
      "Просьба обновить данные",
    ],
    hints: ["Будьте кратки и формальны", "Без лишних деталей о причинах"],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "hiermit teile ich Ihnen mit, dass ...",
      "Ab dem ... wechsle ich zu Dr. ...",
      "Meine Versicherungsnummer lautet ...",
      "Ich bitte um Aktualisierung meiner Daten.",
    ],
    min_words: 80,
    estimated_minutes: 14,
    ideal_answer: `Sehr geehrte Damen und Herren,

hiermit teile ich Ihnen mit, dass ich meinen Hausarzt wechsle. Ab dem 1. Juni 2026 ist Frau Dr. med. Anna Schmidt (Hauptstraße 12, 10115 Berlin) meine neue Hausärztin.

Ich bitte Sie um die entsprechende Aktualisierung meiner Daten. Meine Versicherungsnummer lautet A123456789.

Falls weitere Unterlagen benötigt werden, lassen Sie es mich bitte kurz wissen.

Vielen Dank im Voraus für Ihre Bemühungen.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Письмо в Jobcenter: запрос документа",
    type: "formal_email",
    topic: "Jobcenter",
    cefr_level: "B1",
    instructions:
      "Напишите в Jobcenter и попросите подтверждение о выплатах за последние 3 месяца. Укажите BG-Nummer и причину запроса.",
    requirements: [
      "Назовите свой Bedarfsgemeinschaft-Nummer",
      "Уточните, какой документ нужен",
      "Объясните причину (например, нужно для квартиры)",
      "Укажите способ доставки (почта или e-mail)",
    ],
    hints: [
      "Никаких эмоций, только факты",
      "Будьте точны: «für die Monate Februar bis April 2026»",
    ],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "meine BG-Nummer lautet ...",
      "Ich bitte Sie um eine Bescheinigung über ...",
      "Ich benötige diese Bescheinigung für ...",
      "Bitte senden Sie das Dokument an ...",
    ],
    min_words: 80,
    estimated_minutes: 14,
    ideal_answer: `Sehr geehrte Damen und Herren,

meine BG-Nummer lautet 12345BG6789. Ich bitte Sie um eine Leistungsbescheinigung über die Zahlungen für die Monate Februar, März und April 2026.

Ich benötige diese Bescheinigung für die Vorlage bei einem potenziellen Vermieter im Rahmen meiner Wohnungssuche. Bitte senden Sie das Dokument per Post an meine Adresse oder per E-Mail an artur@example.com.

Vielen Dank für Ihre Mühe.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Отпуск: заявление работодателю",
    type: "application",
    topic: "Arbeit",
    cefr_level: "B1",
    instructions:
      "Напишите краткое заявление руководителю на отпуск. Укажите даты, кто вас заменит и попросите подтверждение.",
    requirements: [
      "Формальное обращение по имени",
      "Точные даты отпуска",
      "Кто будет замещать",
      "Запрос подтверждения",
    ],
    hints: ["Кратко, без объяснений причин отпуска"],
    useful_phrases: [
      "Sehr geehrter Herr / Frau ...,",
      "hiermit beantrage ich Urlaub vom ... bis zum ...",
      "Während meiner Abwesenheit übernimmt ...",
      "Ich bitte um Ihre Bestätigung.",
      "Mit freundlichen Grüßen,",
    ],
    min_words: 70,
    estimated_minutes: 12,
    ideal_answer: `Sehr geehrter Herr Schulz,

hiermit beantrage ich Urlaub vom 1. bis 14. August 2026 (insgesamt 10 Arbeitstage).

Während meiner Abwesenheit übernimmt meine Kollegin Frau Becker die laufenden Aufgaben. Wir haben dies bereits abgesprochen.

Ich bitte um Ihre Bestätigung.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Reklamation: бракованный товар",
    type: "complaint",
    topic: "Einkauf",
    cefr_level: "B1",
    instructions:
      "Вы купили в интернет-магазине товар, и он пришёл бракованный. Напишите формальную жалобу: опишите проблему и попросите замену или возврат денег.",
    requirements: [
      "Номер заказа и дата покупки",
      "Описание дефекта",
      "Чёткое требование (Umtausch / Rückerstattung)",
      "Срок ожидания ответа",
    ],
    hints: [
      "Сохраняйте формальный тон",
      "Не угрожайте — попросите конкретное решение",
    ],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "ich habe am ... bei Ihnen ... bestellt (Bestellnummer ...).",
      "Leider ist der Artikel ...",
      "Ich bitte um Umtausch / Rückerstattung.",
      "Für eine Antwort innerhalb von 14 Tagen wäre ich dankbar.",
    ],
    min_words: 90,
    estimated_minutes: 15,
    ideal_answer: `Sehr geehrte Damen und Herren,

ich habe am 15. April 2026 in Ihrem Online-Shop einen Wasserkocher bestellt (Bestellnummer 987654). Die Lieferung ist am 18. April bei mir eingetroffen.

Leider ist der Artikel beschädigt: das Gerät schaltet sich nach wenigen Sekunden automatisch aus, das Wasser wird nicht heiß. Fotos der Mängel füge ich bei.

Ich bitte Sie um einen kostenfreien Umtausch oder die Rückerstattung des Kaufpreises in Höhe von 39,99 €. Für eine Antwort innerhalb von 14 Tagen wäre ich Ihnen sehr dankbar.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Termin vereinbaren: Bürgeramt",
    type: "appointment",
    topic: "Behörden",
    cefr_level: "B1",
    instructions:
      "Напишите в Bürgeramt с просьбой назначить встречу для Anmeldung. Укажите цель, удобное время и контакты.",
    requirements: [
      "Цель визита (Anmeldung)",
      "Два-три варианта удобного времени",
      "Контактные данные",
      "Поблагодарите за помощь",
    ],
    hints: ["Если есть Bürgerportal — упомяните, что номер пытались получить онлайн"],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "ich möchte einen Termin vereinbaren, um ...",
      "Folgende Termine würden mir passen: ...",
      "Sie erreichen mich unter ...",
      "Vielen Dank im Voraus.",
    ],
    min_words: 80,
    estimated_minutes: 13,
    ideal_answer: `Sehr geehrte Damen und Herren,

ich bin neu in Berlin und möchte einen Termin im Bürgeramt vereinbaren, um meinen Wohnsitz anzumelden. Eine Online-Buchung über das Bürgerportal war leider in den nächsten vier Wochen nicht möglich.

Folgende Termine würden mir besonders gut passen: Dienstag- oder Mittwochvormittag zwischen 9 und 12 Uhr. Bei Bedarf bin ich aber zeitlich flexibel.

Sie erreichen mich telefonisch unter 0176 12345678 oder per E-Mail an artur@example.com.

Vielen Dank im Voraus für Ihre Mühe.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Извинение за пропуск работы",
    type: "formal_email",
    topic: "Arbeit",
    cefr_level: "B1",
    instructions:
      "Вы пропустили рабочий день из-за болезни. Напишите начальнику короткое извинение и приложите Krankschreibung.",
    requirements: [
      "Формальное обращение",
      "Извинение и причина",
      "Упоминание Krankschreibung",
      "Готовность нагнать пропущенное",
    ],
    hints: ["Тон — извинительный, но без излишних подробностей о болезни"],
    useful_phrases: [
      "Sehr geehrter Herr ...,",
      "es tut mir leid, dass ich ...",
      "Eine Krankschreibung füge ich bei.",
      "Ich werde die Arbeit nachholen.",
    ],
    min_words: 80,
    estimated_minutes: 12,
    ideal_answer: `Sehr geehrter Herr Müller,

es tut mir leid, dass ich gestern, am 28. April, nicht zur Arbeit kommen konnte. Ich war seit dem frühen Morgen krank und musste zum Arzt.

Eine Krankschreibung für gestern und heute füge ich diesem Schreiben bei.

Die ausgefallene Arbeit werde ich so bald wie möglich nachholen. Falls etwas Dringendes ansteht, bin ich per E-Mail erreichbar.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Письмо в школу: отсутствие ребёнка",
    type: "formal_email",
    topic: "Ausbildung",
    cefr_level: "B1",
    instructions:
      "Напишите классному руководителю: ваш ребёнок не сможет прийти в школу 2 дня по семейным обстоятельствам. Попросите выдать домашнее задание.",
    requirements: [
      "Имя ребёнка и класс",
      "Даты отсутствия и причина (кратко)",
      "Просьба о домашнем задании",
      "Готовность всё нагнать",
    ],
    hints: ["Не углубляйтесь в личные подробности"],
    useful_phrases: [
      "Sehr geehrte Frau ...,",
      "mein Sohn / meine Tochter ... besucht Ihre Klasse ...",
      "Aus familiären Gründen wird er / sie ... fehlen.",
      "Bitte schicken Sie die Hausaufgaben per E-Mail.",
    ],
    min_words: 80,
    estimated_minutes: 12,
    ideal_answer: `Sehr geehrte Frau Wagner,

mein Sohn Lukas Beispiel besucht Ihre Klasse 4b. Aus dringenden familiären Gründen wird er am Donnerstag, 7. Mai, und Freitag, 8. Mai, leider nicht in die Schule kommen können.

Ich bitte Sie, mir die Hausaufgaben für diese Tage per E-Mail an artur@example.com zu senden. Lukas wird den verpassten Stoff am Wochenende nachholen.

Vielen Dank für Ihr Verständnis.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },

  // ─── B2 ──────────────────────────────────────────────────────────────────
  {
    title: "Bewerbung: сопроводительное письмо",
    type: "application",
    topic: "Bewerbung",
    cefr_level: "B2",
    instructions:
      "Напишите Anschreiben на должность, которая вас интересует. Опишите релевантный опыт, мотивацию и почему вы подходите.",
    requirements: [
      "Формальная шапка не нужна — только текст",
      "Указать конкретную должность и источник вакансии",
      "Минимум 2 релевантных опыта/навыка",
      "Чёткая мотивация",
      "Предложение прийти на собеседование",
    ],
    hints: [
      "Не повторяйте резюме дословно — приведите 1-2 ярких примера",
      "Тон уверенный, но не самоуверенный",
    ],
    useful_phrases: [
      "Sehr geehrte Frau ...,",
      "mit großem Interesse habe ich Ihre Stellenanzeige als ... gelesen.",
      "In meiner aktuellen Position bei ... bin ich verantwortlich für ...",
      "Besonders an Ihrem Unternehmen reizt mich ...",
      "Über die Möglichkeit eines persönlichen Gesprächs würde ich mich freuen.",
      "Mit freundlichen Grüßen,",
    ],
    min_words: 150,
    estimated_minutes: 25,
    ideal_answer: `Sehr geehrte Frau Becker,

mit großem Interesse habe ich Ihre Stellenanzeige als Junior Frontend-Entwickler auf StepStone gelesen. Da meine Qualifikationen sehr gut zu den genannten Anforderungen passen, bewerbe ich mich gerne bei Ihnen.

In meiner aktuellen Position bei Beispiel GmbH bin ich seit zwei Jahren für die Weiterentwicklung interner Tools mit React und TypeScript verantwortlich. Dabei konnte ich Erfahrungen in agilen Teams sammeln und mehrere Features vom Konzept bis zur Auslieferung begleiten. Zudem habe ich in einem Open-Source-Projekt eine Komponentenbibliothek aufgebaut, die heute von vier weiteren Teams genutzt wird.

Besonders an Ihrem Unternehmen reizt mich der Fokus auf zugängliche Webanwendungen sowie die offene Engineering-Kultur, von der ich auf Konferenzen mehrfach gehört habe. Ich bin überzeugt, dass ich mit meiner Erfahrung in Komponenten-Design und meiner Begeisterung für saubere, gut getestete UIs einen wertvollen Beitrag leisten kann.

Über die Möglichkeit eines persönlichen Gesprächs würde ich mich sehr freuen.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Motivationsschreiben: Studium",
    type: "application",
    topic: "Studium",
    cefr_level: "B2",
    instructions:
      "Напишите мотивационное письмо для поступления в университет. Объясните, почему именно эта программа и этот университет.",
    requirements: [
      "Назовите программу и университет",
      "Опишите релевантный опыт (учебный, профессиональный)",
      "Объясните мотивацию и долгосрочные цели",
      "Покажите, чем вы будете полезны вузу",
    ],
    hints: ["Избегайте клише («I always loved Germany»)", "Показывайте через примеры"],
    useful_phrases: [
      "Mit großem Interesse habe ich von dem Masterstudiengang ... an der ... erfahren.",
      "Während meines Bachelors in ... habe ich ...",
      "Mein Ziel ist es, ...",
      "Die Forschungsschwerpunkte Ihres Lehrstuhls passen ideal zu ...",
    ],
    min_words: 150,
    estimated_minutes: 25,
    ideal_answer: `Sehr geehrtes Auswahlkomitee,

mit großem Interesse habe ich von dem Masterstudiengang Data Science an der Technischen Universität München erfahren und möchte mich hiermit um einen Studienplatz bewerben.

Während meines Bachelors in Informatik an der Universität Kiew habe ich mich vor allem auf maschinelles Lernen spezialisiert. In meiner Bachelorarbeit habe ich ein Modell zur Vorhersage von Energieverbrauch in Smart Homes entwickelt, das später in einer Pilotstudie tatsächlich eingesetzt wurde. Parallel dazu habe ich anderthalb Jahre bei einem Berliner Start-up Daten-Pipelines gewartet und so viel praktische Erfahrung mit verteilten Systemen gesammelt.

Mein Ziel ist es, langfristig im Bereich verantwortungsvoller KI zu forschen und Modelle zu bauen, die nicht nur genau, sondern auch fair und nachvollziehbar sind. Die Forschungsschwerpunkte Ihres Lehrstuhls für Trustworthy ML passen ideal zu diesem Vorhaben. Insbesondere die Arbeiten von Frau Prof. Dr. Lange zu Interpretierbarkeit waren ein wichtiger Impuls für meine Bewerbung.

Ich bin überzeugt, dass ich mit meiner Vorbildung und meiner Motivation einen aktiven Beitrag in Vorlesungen, Projekten und Forschung leisten kann.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Meinungsäußerung: Homeoffice oder Büro?",
    type: "opinion_text",
    topic: "Arbeit",
    cefr_level: "B2",
    instructions:
      "Напишите аргументированный текст: что лучше — работа из дома или в офисе. Приведите 2 аргумента «за» и 1 «против», в конце — ваше мнение.",
    requirements: [
      "Введение с темой",
      "Минимум 2 аргумента за",
      "Минимум 1 контраргумент",
      "Личное заключение",
      "Использовать минимум 3 связки (außerdem, jedoch, zudem...)",
    ],
    hints: ["Не путайте мнение и факт", "Используйте Konjunktiv II при гипотезах"],
    useful_phrases: [
      "In den letzten Jahren wird ... immer häufiger diskutiert.",
      "Ein wichtiges Argument für ... ist, dass ...",
      "Außerdem ...",
      "Auf der anderen Seite ...",
      "Meiner Meinung nach ...",
    ],
    min_words: 180,
    estimated_minutes: 30,
    ideal_answer: `In den letzten Jahren wird die Frage, ob Homeoffice oder Büroarbeit produktiver ist, immer häufiger diskutiert. Beide Modelle haben Vor- und Nachteile, doch insgesamt überwiegen aus meiner Sicht die Vorteile flexibler Lösungen.

Ein wichtiges Argument für das Homeoffice ist die Zeitersparnis. Wer nicht täglich pendeln muss, gewinnt schnell mehrere Stunden pro Woche, die in Erholung oder konzentrierte Arbeit fließen können. Außerdem zeigt die Forschung, dass viele Beschäftigte zu Hause weniger durch Smalltalk und ungeplante Meetings unterbrochen werden und so anspruchsvolle Aufgaben tiefer durchdringen.

Auf der anderen Seite leidet im Homeoffice oft das informelle Miteinander. Spontane Gespräche in der Kaffeeküche führen häufig zu kreativen Ideen und stärken das Vertrauen im Team. Wer dauerhaft zu Hause arbeitet, verliert leicht den Anschluss an die Unternehmenskultur.

Meiner Meinung nach ist deshalb eine hybride Lösung am sinnvollsten: zwei feste Bürotage pro Woche für Austausch und Entscheidungen, der Rest flexibel. So lassen sich konzentriertes Arbeiten und Teamgefühl sinnvoll verbinden.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Formal Complaint: Lärmbelästigung",
    type: "complaint",
    topic: "Wohnung",
    cefr_level: "B2",
    instructions:
      "Напишите управляющему домом жалобу на шум от соседей сверху. Укажите факты, попытки решить проблему и желаемое действие.",
    requirements: [
      "Конкретные даты/время шума",
      "Что вы уже пробовали (поговорить, записать)",
      "Просьба о медиации или предупреждении соседям",
      "Срок ожидаемого ответа",
    ],
    hints: [
      "Тон — фактический, без оскорблений",
      "Не угрожайте судом — пока ещё нет",
    ],
    useful_phrases: [
      "Sehr geehrte Frau / Herr ...,",
      "ich wende mich an Sie wegen wiederholter Lärmbelästigung ...",
      "Konkret handelt es sich um folgende Vorfälle: ...",
      "Ein klärendes Gespräch hat bisher zu keiner Verbesserung geführt.",
      "Ich bitte Sie daher um ...",
    ],
    min_words: 150,
    estimated_minutes: 22,
    ideal_answer: `Sehr geehrter Herr Bauer,

ich wende mich an Sie als Hausverwaltung wegen wiederholter Lärmbelästigung durch die Mietpartei in Wohnung 4B (Familie X). Konkret handelt es sich um folgende Vorfälle: am 12., 18. und 26. April jeweils zwischen 23 und 1 Uhr lautes Musikhören sowie am 1. Mai über mehrere Stunden Bohrgeräusche bis weit nach 22 Uhr.

Ich habe das Gespräch mit den Nachbarn bereits zweimal gesucht und freundlich auf die Ruhezeiten hingewiesen. Eine spürbare Verbesserung gab es leider nicht. Auch andere Mietparteien haben mir bestätigt, dass sie sich gestört fühlen, möchten sich aber nicht namentlich melden.

Ich bitte Sie daher, die Familie schriftlich auf die Hausordnung und die geltenden Ruhezeiten hinzuweisen und gegebenenfalls ein gemeinsames Gespräch zu vermitteln. Eine Rückmeldung innerhalb von zwei Wochen wäre für mich sehr hilfreich.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Argumentation: Englisch als Schulfach ab Klasse 1?",
    type: "opinion_text",
    topic: "Ausbildung",
    cefr_level: "B2",
    instructions:
      "Напишите эссе с аргументами: должно ли преподавание английского начинаться с 1-го класса? Сформулируйте вашу позицию.",
    requirements: [
      "Введение с тезисом",
      "Минимум 2 аргумента и 1 контраргумент",
      "Связки и логика",
      "Заключение с выводом",
    ],
    hints: ["Используйте сравнения с другими странами", "Не используйте «ich denke» в каждом абзаце"],
    useful_phrases: [
      "In Deutschland wird kontrovers diskutiert, ob ...",
      "Befürworter argumentieren, dass ...",
      "Kritiker geben zu bedenken, dass ...",
      "Letztlich überwiegen die Vorteile, weil ...",
    ],
    min_words: 200,
    estimated_minutes: 30,
    ideal_answer: `In Deutschland wird seit Jahren kontrovers diskutiert, ob Englisch bereits ab der ersten Klasse unterrichtet werden sollte. Die Debatte ist nicht zuletzt deshalb so hitzig, weil sie zwischen Bildungschancen und schulischer Überforderung steht.

Befürworter argumentieren, dass Kinder eine Fremdsprache umso leichter lernen, je früher sie damit in Kontakt kommen. Tatsächlich zeigen Studien, dass Aussprache und Hörverstehen bis etwa zum siebten Lebensjahr besonders flexibel sind. Hinzu kommt, dass Englisch heute praktisch überall im Alltag und Beruf benötigt wird, sodass ein früher Start die spätere Schullaufbahn entlastet.

Kritiker geben jedoch zu bedenken, dass viele Erstklässler zunächst grundlegende Lese- und Schreibfähigkeiten in der Muttersprache aufbauen müssen. Wenn Englisch hier zusätzlich gelehrt wird, kann dies einzelne Kinder, vor allem aus mehrsprachigen Familien, überfordern.

Letztlich überwiegen aus meiner Sicht die Vorteile eines frühen, aber spielerischen Englischunterrichts. Wenn er als Lieder, Spiele und einfache Dialoge gestaltet ist und nicht in formalen Tests endet, lernen die meisten Kinder ohne Druck und gewinnen früh Selbstvertrauen im Umgang mit der Sprache. Wichtig bleibt allerdings, dass die Lehrkräfte didaktisch gut ausgebildet sind und Ressourcen für Differenzierung bekommen.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Professional Email: Rückmeldung auf Angebot",
    type: "formal_email",
    topic: "Arbeit",
    cefr_level: "B2",
    instructions:
      "Ответьте на полученное от поставщика коммерческое предложение: попросите уточнения по 2 пунктам и предложите следующий шаг.",
    requirements: [
      "Поблагодарите за предложение",
      "Сформулируйте 2 конкретных вопроса",
      "Предложите встречу или звонок",
      "Чёткие дедлайны",
    ],
    hints: ["Соблюдайте корпоративный тон", "Не пишите слишком длинно"],
    useful_phrases: [
      "Vielen Dank für Ihr Angebot vom ...",
      "Bevor wir weiter entscheiden, hätten wir noch zwei Rückfragen.",
      "Erstens ... Zweitens ...",
      "Ich schlage vor, dass wir ...",
    ],
    min_words: 130,
    estimated_minutes: 20,
    ideal_answer: `Sehr geehrte Frau Schmidt,

vielen Dank für Ihr ausführliches Angebot vom 28. April 2026 zur Implementierung des CRM-Systems. Bevor wir intern weiter entscheiden, hätten wir noch zwei Rückfragen.

Erstens: Ist der genannte Festpreis von 18.500 € auch dann gültig, wenn wir die Schulung der Endanwender erst im dritten Quartal durchführen lassen, oder fällt dafür ein Zuschlag an? Zweitens: Welche Datenmigrationsleistungen sind im Pauschalpreis enthalten? Aus Ihrem Dokument geht für uns nicht eindeutig hervor, ob auch historische Kontaktdaten der letzten fünf Jahre übernommen werden.

Ich schlage vor, dass wir die offenen Punkte in einem kurzen Online-Termin besprechen. Würde es Ihnen am Donnerstag, 7. Mai, zwischen 10 und 12 Uhr passen?

Über eine Antwort bis Freitag dieser Woche würde ich mich freuen.

Mit freundlichen Grüßen,
Artur Beispiel
Projektleitung Digitalisierung`,
  },
  {
    title: "Exam Letter: Beschwerde Mietminderung",
    type: "exam_letter",
    topic: "Wohnung",
    cefr_level: "B2",
    instructions:
      "Напишите формальное письмо арендодателю с обоснованным требованием снизить квартплату из-за длительной поломки лифта (важно для экзамена B2: 3 ясных аргумента и просьба).",
    requirements: [
      "Формальное обращение",
      "Описание ситуации с датами",
      "Минимум 3 аргумента, почему это создаёт проблемы",
      "Чёткое требование о снижении (в %)",
      "Срок ответа",
    ],
    hints: ["Сошлитесь на §536 BGB вкратце, без точной цитаты", "Не угрожайте, опирайтесь на закон"],
    useful_phrases: [
      "Sehr geehrte Damen und Herren,",
      "seit dem ... ist der Aufzug in unserem Haus ... außer Betrieb.",
      "Diese Situation belastet mich aus folgenden Gründen ...",
      "Ich beantrage daher eine Mietminderung in Höhe von ...",
      "Ich bitte um Ihre schriftliche Bestätigung bis zum ...",
    ],
    min_words: 180,
    estimated_minutes: 28,
    ideal_answer: `Sehr geehrte Damen und Herren,

seit dem 15. März 2026 ist der Aufzug in unserem Haus in der Musterstraße 15 dauerhaft außer Betrieb. Trotz mehrfacher Anfragen ist bis heute, sechs Wochen später, keine Reparatur erfolgt.

Diese Situation belastet mich und meine Familie aus mehreren Gründen erheblich. Erstens wohne ich im fünften Stock und muss schwere Einkäufe zu Fuß tragen, was bei Bandscheibenproblemen besonders schwierig ist. Zweitens kommt meine Mutter, die in einem Rollator angewiesen ist, derzeit gar nicht mehr zu Besuch. Drittens fühlen sich auch die älteren Nachbarn im vierten Stock erheblich eingeschränkt.

Da ein funktionierender Aufzug zur vereinbarten Mietsache gehört, beantrage ich gemäß §536 BGB eine Mietminderung in Höhe von 10 Prozent für den Zeitraum vom 15. März 2026 bis zur vollständigen Wiederinbetriebnahme. Bei längerer Dauer behalte ich mir vor, den Minderungssatz neu zu bewerten.

Ich bitte um Ihre schriftliche Bestätigung sowie um eine verbindliche Auskunft zum Reparaturtermin bis spätestens 15. Mai 2026.

Mit freundlichen Grüßen,
Artur Beispiel`,
  },
  {
    title: "Exam Letter: Privater Brief — Reisebericht",
    type: "exam_letter",
    topic: "Reise",
    cefr_level: "B1",
    instructions:
      "Напишите другу личное письмо о недавней поездке: расскажите о маршруте, ярких моментах и проблемах, в конце пригласите его в следующий раз.",
    requirements: [
      "Неформальное приветствие",
      "Маршрут (минимум 2 города)",
      "Один яркий позитивный момент",
      "Одна проблема или сложность",
      "Приглашение",
    ],
    hints: ["Используйте Präteritum или Perfekt последовательно"],
    useful_phrases: [
      "Lieber ...,",
      "ich melde mich endlich nach meiner Reise!",
      "Besonders gefallen hat mir ...",
      "Leider ...",
      "Hast du Lust, beim nächsten Mal mitzukommen?",
      "Ich freue mich, bald von dir zu hören.",
      "Liebe Grüße,",
    ],
    min_words: 120,
    estimated_minutes: 18,
    ideal_answer: `Lieber Tom,

ich melde mich endlich nach meiner zweiwöchigen Reise durch Italien! Wir sind zuerst nach Rom geflogen, haben dort drei Tage verbracht und sind dann mit dem Zug weiter nach Florenz und Venedig gefahren.

Besonders gefallen hat mir Florenz: das Essen war fantastisch und die Stadt ist nicht so überlaufen wie Rom. An einem Abend haben wir an einem kleinen Kochkurs teilgenommen und selbst Pasta gemacht. Das war wirklich ein Highlight.

Leider ist uns in Venedig in der ersten Nacht ein Rucksack gestohlen worden, mit Pass und Bankkarten. Das war unangenehm, aber die Polizei hat schnell geholfen und die Botschaft hat innerhalb eines Tages ein Ersatzdokument ausgestellt.

Hast du eigentlich Lust, beim nächsten Mal mitzukommen? Ich plane für nächstes Jahr einen Roadtrip durch Süddeutschland und Österreich. Mit dir wäre das bestimmt richtig schön.

Ich freue mich, bald von dir zu hören.

Liebe Grüße,
Artur`,
  },
  {
    title: "Antwort auf Einladung absagen",
    type: "informal_message",
    topic: "Alltag",
    cefr_level: "B1",
    instructions:
      "Друг пригласил вас на день рождения. Вежливо откажитесь, объясните причину и предложите альтернативу.",
    requirements: [
      "Поблагодарите за приглашение",
      "Объясните причину отказа",
      "Поздравьте заранее",
      "Предложите встретиться в другой день",
    ],
    hints: ["Тон тёплый, не формальный"],
    useful_phrases: [
      "Vielen Dank für deine Einladung!",
      "Leider kann ich nicht kommen, weil ...",
      "Ich wünsche dir alles Gute zum Geburtstag!",
      "Lass uns nächste Woche etwas zusammen unternehmen.",
    ],
    min_words: 80,
    estimated_minutes: 12,
    ideal_answer: `Liebe Anna,

vielen Dank für deine Einladung zu deinem 30. Geburtstag! Ich freue mich riesig, dass du an mich gedacht hast.

Leider kann ich am Samstag nicht kommen, weil ich an diesem Wochenende beruflich in Hamburg sein muss. Das wurde leider erst sehr kurzfristig festgelegt.

Ich wünsche dir schon jetzt einen wunderschönen Tag, viel Spaß mit deinen Lieben und alles Gute zum Geburtstag!

Lass uns unbedingt nächste Woche zusammen essen gehen — dann feiern wir nach. Hast du am Mittwoch oder Donnerstag Zeit?

Liebe Grüße und bis bald,
Artur`,
  },
];

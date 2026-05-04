import type { CEFRLevel } from "@/types";

export interface SpeakingScenario {
  id: string;
  title: string;
  title_ru: string;
  emoji: string;
  topic: string;
  cefr_level: CEFRLevel;
  goal: string;
  description: string;
  /** Role that AI plays (in German + Russian) */
  ai_role: { de: string; ru: string };
  /** Role the user plays */
  user_role: { de: string; ru: string };
  /** Opening message from AI to start the conversation */
  opening_message_de: string;
  opening_message_ru: string;
  /** Useful phrases the user might want to use */
  useful_phrases: { de: string; ru: string }[];
  /** Topics/words the user should try to mention */
  goals_checklist: string[];
}

export const SPEAKING_SCENARIOS: SpeakingScenario[] = [
  {
    id: "arzttermin",
    title: "Arzttermin vereinbaren",
    title_ru: "Записаться к врачу",
    emoji: "🏥",
    topic: "Gesundheit",
    cefr_level: "A2",
    goal: "Записаться на приём, описать симптомы, договориться о времени",
    description: "Ты звонишь в Arztpraxis. Нужно записаться на приём, описать симптомы и согласовать удобное время.",
    ai_role: {
      de: "Sie sind die Sprechstundenhilfe in einer Hausarztpraxis. Antworten Sie freundlich und stellen Sie konkrete Fragen.",
      ru: "Регистратор в практике семейного врача",
    },
    user_role: {
      de: "Sie sind ein Patient/eine Patientin und möchten einen Termin vereinbaren.",
      ru: "Пациент, который хочет записаться",
    },
    opening_message_de: "Hausarztpraxis Dr. Schmidt, guten Tag. Was kann ich für Sie tun?",
    opening_message_ru: "Семейная практика доктора Шмидта, добрый день. Чем могу помочь?",
    useful_phrases: [
      { de: "Ich möchte einen Termin vereinbaren.", ru: "Я хотел бы записаться на приём." },
      { de: "Ich habe seit drei Tagen Husten und Fieber.", ru: "У меня уже три дня кашель и температура." },
      { de: "Wann hätten Sie einen Termin frei?", ru: "Когда у вас есть свободное время?" },
      { de: "Geht es auch nachmittags?", ru: "А во второй половине дня тоже можно?" },
      { de: "Ich bin gesetzlich versichert.", ru: "У меня государственная страховка." },
      { de: "Soll ich etwas mitbringen?", ru: "Что мне взять с собой?" },
    ],
    goals_checklist: [
      "Объяснить, зачем звоните",
      "Описать минимум 1 симптом",
      "Согласовать дату и время",
      "Уточнить, что взять с собой",
    ],
  },
  {
    id: "wohnungsbesichtigung",
    title: "Wohnungsbesichtigung",
    title_ru: "Просмотр квартиры",
    emoji: "🏠",
    topic: "Wohnung",
    cefr_level: "B1",
    goal: "Узнать детали квартиры, цену, условия и договориться о просмотре",
    description: "Ты звонишь арендодателю по объявлению о квартире. Узнай условия и договорись о Besichtigung.",
    ai_role: {
      de: "Sie sind der Vermieter/die Vermieterin einer Zweizimmerwohnung in Berlin-Mitte. Geben Sie freundliche, konkrete Antworten zu Miete, Zimmern, Einzug und Besichtigungstermin.",
      ru: "Арендодатель двухкомнатной квартиры",
    },
    user_role: {
      de: "Sie suchen eine Wohnung und rufen wegen einer Anzeige an.",
      ru: "Потенциальный арендатор",
    },
    opening_message_de: "Hallo, hier spricht Frau Becker. Sie haben wegen der Wohnung in der Marienstraße angerufen?",
    opening_message_ru: "Здравствуйте, госпожа Беккер. Вы звонили по поводу квартиры на Marienstraße?",
    useful_phrases: [
      { de: "Ich interessiere mich für die Wohnung.", ru: "Меня интересует эта квартира." },
      { de: "Wie hoch ist die Warmmiete?", ru: "Сколько составляет аренда с коммуналкой?" },
      { de: "Ist die Wohnung möbliert?", ru: "Квартира меблированная?" },
      { de: "Wann kann ich sie besichtigen?", ru: "Когда я могу её посмотреть?" },
      { de: "Sind Haustiere erlaubt?", ru: "Домашние животные разрешены?" },
      { de: "Wie hoch ist die Kaution?", ru: "Какой залог?" },
    ],
    goals_checklist: [
      "Представиться и сказать, что интересует",
      "Узнать цену (Warmmiete/Kaltmiete)",
      "Спросить о Kaution",
      "Договориться о просмотре",
    ],
  },
  {
    id: "vorstellungsgespraech",
    title: "Vorstellungsgespräch",
    title_ru: "Собеседование",
    emoji: "💼",
    topic: "Arbeit",
    cefr_level: "B1",
    goal: "Представить себя, рассказать об опыте, ответить на вопросы работодателя",
    description: "Собеседование на должность. Расскажи о себе, своём опыте и почему ты подходишь для этой работы.",
    ai_role: {
      de: "Sie sind Personalleiter/in und führen ein Vorstellungsgespräch. Stellen Sie typische Fragen: Wer sind Sie? Erfahrungen? Stärken? Warum gerade hier? Bleiben Sie professionell und höflich.",
      ru: "HR-менеджер на собеседовании",
    },
    user_role: {
      de: "Sie sind Bewerber/in und möchten den Job bekommen.",
      ru: "Кандидат на должность",
    },
    opening_message_de: "Schönen guten Tag, herzlich willkommen! Schön, dass Sie da sind. Bitte stellen Sie sich kurz vor.",
    opening_message_ru: "Добрый день, добро пожаловать! Хорошо, что вы пришли. Пожалуйста, кратко представьтесь.",
    useful_phrases: [
      { de: "Mein Name ist ... und ich komme aus ...", ru: "Меня зовут ..., я из ..." },
      { de: "Ich habe Erfahrung als ...", ru: "У меня есть опыт работы ..." },
      { de: "Meine Stärken sind ...", ru: "Мои сильные стороны — ..." },
      { de: "Ich bin teamfähig und lernbereit.", ru: "Я командный игрок и готов учиться." },
      { de: "Ich interessiere mich für diese Stelle, weil ...", ru: "Меня интересует эта должность, потому что ..." },
      { de: "Ich spreche Deutsch auf B1-Niveau.", ru: "Я говорю по-немецки на уровне B1." },
    ],
    goals_checklist: [
      "Представиться (имя, возраст, происхождение)",
      "Рассказать об опыте работы",
      "Назвать свои сильные стороны",
      "Объяснить, почему подходишь",
      "Задать встречный вопрос",
    ],
  },
  {
    id: "supermarkt",
    title: "Im Supermarkt",
    title_ru: "В супермаркете",
    emoji: "🛒",
    topic: "Alltag",
    cefr_level: "A2",
    goal: "Найти товар, спросить о цене, оплатить покупки",
    description: "Ты в супермаркете и не можешь найти нужные продукты. Спроси сотрудника и оплати на кассе.",
    ai_role: {
      de: "Sie arbeiten im Supermarkt — abwechselnd als Mitarbeiter im Regal und als Kassierer. Helfen Sie freundlich.",
      ru: "Сотрудник супермаркета и кассир",
    },
    user_role: {
      de: "Sie kaufen ein und brauchen Hilfe.",
      ru: "Покупатель",
    },
    opening_message_de: "Guten Tag, kann ich Ihnen helfen?",
    opening_message_ru: "Добрый день, могу я вам помочь?",
    useful_phrases: [
      { de: "Entschuldigung, wo finde ich ...?", ru: "Извините, где я могу найти ...?" },
      { de: "Was kostet das?", ru: "Сколько это стоит?" },
      { de: "Haben Sie ... auch in ...?", ru: "У вас есть ... в ...?" },
      { de: "Ich nehme das.", ru: "Я возьму это." },
      { de: "Kann ich mit Karte bezahlen?", ru: "Можно оплатить картой?" },
      { de: "Brauchen Sie eine Tüte?", ru: "Вам нужен пакет?" },
    ],
    goals_checklist: [
      "Спросить, где находится товар",
      "Уточнить цену",
      "Оплатить картой/наличными",
      "Попросить пакет или чек",
    ],
  },
  {
    id: "behoerde",
    title: "Bei der Behörde",
    title_ru: "В Behörde (госучреждение)",
    emoji: "🏛️",
    topic: "Behörden",
    cefr_level: "B1",
    goal: "Подать документы на Anmeldung, объяснить ситуацию, ответить на вопросы",
    description: "Ты в Bürgeramt для регистрации по новому адресу (Anmeldung). Сотрудник задаёт вопросы по документам.",
    ai_role: {
      de: "Sie sind Sachbearbeiter/in im Bürgeramt und betreuen die Anmeldung des Wohnsitzes. Stellen Sie typische Fragen zu Pass, Anschrift, Wohnungsgeber, Einzugsdatum. Sprechen Sie sachlich.",
      ru: "Сотрудник Bürgeramt",
    },
    user_role: {
      de: "Sie melden Ihren Wohnsitz an.",
      ru: "Гражданин, регистрирующий место жительства",
    },
    opening_message_de: "Guten Tag, bitte setzen Sie sich. Worum geht es?",
    opening_message_ru: "Добрый день, садитесь, пожалуйста. О чём пойдёт речь?",
    useful_phrases: [
      { de: "Ich möchte mich anmelden.", ru: "Я хочу зарегистрироваться." },
      { de: "Hier ist mein Pass und die Wohnungsgeberbestätigung.", ru: "Вот мой паспорт и подтверждение от арендодателя." },
      { de: "Ich bin am ... eingezogen.", ru: "Я въехал ..." },
      { de: "Meine neue Adresse lautet ...", ru: "Мой новый адрес ..." },
      { de: "Brauchen Sie noch weitere Unterlagen?", ru: "Нужны ещё какие-то документы?" },
      { de: "Wann bekomme ich die Meldebescheinigung?", ru: "Когда я получу справку о регистрации?" },
    ],
    goals_checklist: [
      "Объяснить, зачем пришёл",
      "Назвать новый адрес",
      "Сказать дату въезда",
      "Уточнить, какие документы ещё нужны",
    ],
  },
  {
    id: "telefonat-kollege",
    title: "Telefonat mit dem Kollegen",
    title_ru: "Звонок коллеге",
    emoji: "📞",
    topic: "Arbeit",
    cefr_level: "A2",
    goal: "Сообщить о болезни, договориться о замене, обсудить дела",
    description: "Ты звонишь коллеге утром, чтобы сообщить, что ты болен и не придёшь на работу.",
    ai_role: {
      de: "Sie sind ein Kollege/eine Kollegin am Telefon. Antworten Sie freundlich und besprechen Sie, wie die Arbeit verteilt wird.",
      ru: "Коллега по работе",
    },
    user_role: {
      de: "Sie sind krank und müssen den Kollegen informieren.",
      ru: "Заболевший сотрудник",
    },
    opening_message_de: "Hallo, hier ist Anna. Was gibt's?",
    opening_message_ru: "Привет, это Анна. Что случилось?",
    useful_phrases: [
      { de: "Ich bin heute leider krank.", ru: "Я сегодня, к сожалению, болен." },
      { de: "Kannst du das dem Chef sagen?", ru: "Можешь сказать шефу?" },
      { de: "Ich habe einen Termin beim Arzt.", ru: "У меня приём у врача." },
      { de: "Ich melde mich, wenn ich wieder gesund bin.", ru: "Я свяжусь, когда выздоровею." },
      { de: "Kannst du das Meeting für mich übernehmen?", ru: "Можешь провести встречу за меня?" },
      { de: "Vielen Dank für deine Hilfe.", ru: "Большое спасибо за помощь." },
    ],
    goals_checklist: [
      "Поприветствовать и представиться",
      "Сказать, что заболел",
      "Попросить передать шефу",
      "Договориться о замене / делах",
    ],
  },
];

// Daily phrases by category — for the "Phrases" tab
export const DAILY_PHRASES: Record<string, { de: string; ru: string }[]> = {
  Begrüßung: [
    { de: "Guten Morgen!", ru: "Доброе утро!" },
    { de: "Schönen Tag noch!", ru: "Хорошего дня!" },
    { de: "Bis später / Bis bald.", ru: "До скорой встречи." },
    { de: "Wie geht's? — Ganz gut, danke.", ru: "Как дела? — Хорошо, спасибо." },
  ],
  Höflichkeit: [
    { de: "Entschuldigung, ...", ru: "Извините, ..." },
    { de: "Vielen Dank!", ru: "Большое спасибо!" },
    { de: "Bitte schön. / Gern geschehen.", ru: "Пожалуйста." },
    { de: "Kein Problem.", ru: "Без проблем." },
    { de: "Es tut mir leid.", ru: "Мне жаль / Извините." },
  ],
  "Nach dem Weg fragen": [
    { de: "Wie komme ich zum Bahnhof?", ru: "Как пройти на вокзал?" },
    { de: "Ist das weit von hier?", ru: "Это далеко отсюда?" },
    { de: "Können Sie mir das bitte zeigen?", ru: "Можете показать мне?" },
    { de: "Ich habe mich verlaufen.", ru: "Я заблудился." },
  ],
  "Im Restaurant": [
    { de: "Einen Tisch für zwei, bitte.", ru: "Столик на двоих, пожалуйста." },
    { de: "Die Speisekarte, bitte.", ru: "Меню, пожалуйста." },
    { de: "Ich nehme das Gleiche.", ru: "Я возьму то же самое." },
    { de: "Die Rechnung, bitte.", ru: "Счёт, пожалуйста." },
    { de: "Zusammen oder getrennt?", ru: "Вместе или раздельно?" },
  ],
  "Beim Verstehen": [
    { de: "Können Sie das bitte wiederholen?", ru: "Повторите, пожалуйста." },
    { de: "Sprechen Sie bitte langsamer.", ru: "Говорите помедленнее." },
    { de: "Was bedeutet das?", ru: "Что это означает?" },
    { de: "Ich habe nicht verstanden.", ru: "Я не понял." },
    { de: "Wie schreibt man das?", ru: "Как это пишется?" },
  ],
};

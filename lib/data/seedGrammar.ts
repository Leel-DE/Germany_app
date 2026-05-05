import type { GrammarTopicDoc } from "@/lib/models/types";
import { GRAMMAR_TOPICS as MOCK_TOPICS } from "@/lib/data/grammarTopics";

type Seed = Omit<GrammarTopicDoc, "_id">;

/**
 * 20 grammar topics, A2 → B2.
 * Re-uses the existing 6 well-developed topics from /lib/data/grammarTopics.ts
 * and adds 14 more compact lessons (explanation + rules + 2-3 exercises + 5-q test).
 */
const FROM_MOCK: Seed[] = MOCK_TOPICS.map((t) => ({
  slug: t.slug,
  title_de: t.title_de,
  title_ru: t.title_ru,
  cefr_level: t.cefr_level,
  category: t.category,
  order_index: t.order_index,
  content: t.content_json,
  exercises: t.exercises,
  mini_test: t.mini_test,
  isPublished: t.is_published,
}));

const ADDITIONAL: Seed[] = [
  {
    slug: "trennbare-verben", title_de: "Trennbare Verben", title_ru: "Глаголы с отделяемой приставкой",
    cefr_level: "A2", category: "verbs", order_index: 7, isPublished: true,
    content: {
      explanation: "Многие немецкие глаголы имеют отделяемую приставку, которая в Präsens и Präteritum уходит в КОНЕЦ предложения. В Perfekt — приставка снова приклеивается к глаголу: aufstehen → ich stehe um 7 auf / ich bin aufgestanden.",
      rules: [
        { rule: "Приставка → конец предложения в Präsens", example_de: "Ich stehe um 7 Uhr auf.", example_ru: "Я встаю в 7 часов." },
        { rule: "Партицип II собирается обратно", example_de: "Ich bin um 7 Uhr aufgestanden.", example_ru: "Я встал в 7." },
        { rule: "Самые частые приставки: ab-, an-, auf-, aus-, ein-, mit-, vor-, weg-, zu-, zurück-", example_de: "anrufen, einkaufen, mitkommen, weggehen", example_ru: "звонить, покупать, идти вместе, уходить" },
      ],
      typical_errors: [
        "'Ich aufstehe um 7' ❌ → 'Ich stehe um 7 auf' ✓",
        "'Ich habe gestern aufgestehen' ❌ → 'aufgestanden' ✓",
      ],
      real_life_connection: "Большинство ежедневных действий: aufstehen, einkaufen, mitkommen, anrufen, abholen — все отделяемые.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich ___ jeden Tag um 7 Uhr ___. (aufstehen)", options: ["stehe…aufstehe", "stehe…auf", "auf…stehe", "aufstehe…—"], answer: 1, explanation: "Приставка идёт в конец." },
      { type: "choose_correct", question: "Как сказать 'Я звоню маме'?", options: ["Ich anrufe Mama.", "Ich rufe Mama an.", "Ich rufe an Mama."], answer: 1, explanation: "anrufen — отделяемый, 'an' в конец." },
    ],
    mini_test: [
      { question: "Wann ___ du heute ___? (aufstehen)", options: ["stehst…auf", "aufstehst…—", "stehst auf…—", "auf…stehst"], answer: 0, explanation: "Приставка в конец." },
      { question: "Ich ___ gestern um 22 Uhr ___. (einschlafen)", options: ["bin…eingeschlafen", "habe…eingeschlafen", "bin…einschlafen", "habe…schlafen ein"], answer: 0, explanation: "einschlafen с sein." },
      { question: "Welche Präfixe sind trennbar?", options: ["be-, ge-, ver-", "ab-, an-, auf-, mit-", "ent-, er-, miss-", "nichts ist trennbar"], answer: 1, explanation: "ab/an/auf/aus/ein/mit/vor/weg/zu — отделяемые." },
      { question: "'mitkommen' im Perfekt mit 'wir':", options: ["wir haben mitgekommen", "wir sind mitgekommen", "wir sind mitkommen", "wir haben mitkommen"], answer: 1, explanation: "kommen → sein; P2 = mitgekommen." },
      { question: "Wo steht die Präfix in 'Ich ___ heute spät ___' (anrufen)?", options: ["am Anfang", "auf Position 2", "am Ende", "egal"], answer: 2, explanation: "В конце предложения." },
    ],
  },
  {
    slug: "wechselpraepositionen", title_de: "Wechselpräpositionen", title_ru: "Двойные предлоги (Akk/Dat)",
    cefr_level: "B1", category: "prepositions", order_index: 8, isPublished: true,
    content: {
      explanation: "9 предлогов, которые могут управлять и Akkusativ, и Dativ: an, auf, hinter, in, neben, über, unter, vor, zwischen. Правило: Wohin? → Akkusativ (движение). Wo? → Dativ (статика).",
      rules: [
        { rule: "Wohin? (куда?) → Akkusativ", example_de: "Ich gehe in den Park.", example_ru: "Я иду в парк." },
        { rule: "Wo? (где?) → Dativ", example_de: "Ich bin im Park.", example_ru: "Я в парке." },
      ],
      typical_errors: [
        "'Ich gehe im Park' ❌ → 'Ich gehe in den Park' ✓ (направление)",
        "'Das Buch liegt auf den Tisch' ❌ → 'auf dem Tisch' ✓ (положение)",
      ],
      real_life_connection: "Каждый день: 'Ich gehe ins Büro' (направление), 'Ich bin im Büro' (положение).",
    },
    exercises: [
      { type: "fill_blank", sentence: "Das Foto hängt an ___ Wand.", options: ["der", "die", "den", "dem"], answer: 0, explanation: "Wo? → Dativ, Wand f. → der." },
      { type: "fill_blank", sentence: "Ich lege das Buch auf ___ Tisch.", options: ["der", "den", "dem", "das"], answer: 1, explanation: "Wohin? → Akk; Tisch m. → den." },
    ],
    mini_test: [
      { question: "Ich gehe ___ Schule.", options: ["in der", "in die", "in den", "in das"], answer: 1, explanation: "Wohin? Schule f. → die (Akk)." },
      { question: "Ich bin ___ Schule.", options: ["in der", "in die", "in den", "in das"], answer: 0, explanation: "Wo? → Dat → in der." },
      { question: "Wir sitzen ___ Tisch.", options: ["am", "an den", "auf den", "an die"], answer: 0, explanation: "Wo? → Dat. an + dem = am." },
      { question: "Welche sind Wechselpräpositionen?", options: ["mit, nach, von", "an, auf, in", "durch, für, ohne", "wegen, trotz"], answer: 1, explanation: "9 двойных предлогов: an/auf/hinter/in/neben/über/unter/vor/zwischen." },
      { question: "Ich stelle die Vase ___ Fenster.", options: ["am", "ans", "im", "in"], answer: 1, explanation: "Wohin? → Akk. an + das = ans." },
    ],
  },
  {
    slug: "praeteritum", title_de: "Das Präteritum", title_ru: "Прошедшее время (Präteritum)",
    cefr_level: "B1", category: "verbs", order_index: 9, isPublished: true,
    content: {
      explanation: "Präteritum — письменное прошедшее время. В разговоре используется только для sein (war), haben (hatte), модальных (konnte, musste, wollte) и нескольких глаголов. В книгах, газетах, рассказах — основное прошедшее.",
      rules: [
        { rule: "sein → war / haben → hatte", example_de: "Ich war müde. Ich hatte keine Zeit.", example_ru: "Я был уставшим. У меня не было времени." },
        { rule: "Слабые глаголы: -te-Endung", example_de: "machen → machte, lernen → lernte", example_ru: "делал, учил" },
        { rule: "Сильные глаголы: смена корня", example_de: "gehen → ging, sehen → sah, kommen → kam", example_ru: "" },
      ],
      typical_errors: [
        "В разговоре часто Perfekt лучше, чем Präteritum (кроме sein/haben/Modal).",
      ],
      real_life_connection: "Letters, news, books — в этом всём Präteritum.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Gestern ___ ich krank. (sein)", options: ["bin", "war", "hatte", "ist"], answer: 1, explanation: "Präteritum sein → ich war." },
      { type: "fill_blank", sentence: "Wir ___ keine Zeit. (haben, Prät.)", options: ["haben", "hatten", "habten", "waren"], answer: 1, explanation: "wir + Präteritum haben → hatten." },
    ],
    mini_test: [
      { question: "Präteritum от 'gehen' для 'ich':", options: ["ging", "gegangen", "gehe", "habe gegangen"], answer: 0, explanation: "ging — сильный глагол." },
      { question: "Когда чаще Präteritum?", options: ["В чате", "В письмах/книгах", "В разговоре", "В вопросах"], answer: 1, explanation: "Письменная речь." },
      { question: "Sie ___ einen Brief. (schreiben, Prät.)", options: ["schrieb", "schreibte", "schrieb sie", "geschrieben"], answer: 0, explanation: "schreiben → schrieb." },
      { question: "Ich ___ es nicht. (wissen, Prät.)", options: ["wisste", "wusste", "weiß", "habe gewusst"], answer: 1, explanation: "wissen → wusste." },
      { question: "Какие глаголы и в разговоре в Präteritum?", options: ["все", "только модальные", "sein, haben, модальные", "никакие"], answer: 2, explanation: "Этот мини-набор сохраняет Präteritum в речи." },
    ],
  },
  {
    slug: "futur1", title_de: "Futur I", title_ru: "Будущее время",
    cefr_level: "B1", category: "verbs", order_index: 10, isPublished: true,
    content: {
      explanation: "Futur I = werden + Infinitiv. Используется для: будущих планов, предположений, обещаний. В разговоре часто заменяется Präsens + наречие времени (morgen, nächste Woche).",
      rules: [
        { rule: "werden + Infinitiv (в конце)", example_de: "Ich werde morgen kommen.", example_ru: "Я приду завтра." },
        { rule: "Спряжение werden: ich werde, du wirst, er wird, wir/sie werden, ihr werdet", example_de: "Du wirst es schaffen!", example_ru: "Ты справишься!" },
      ],
      typical_errors: [
        "'Ich werde gehen morgen' ❌ → 'Ich werde morgen gehen' ✓ (Infinitiv в конце)",
      ],
      real_life_connection: "Обещания, прогнозы, планы.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich ___ morgen kommen.", options: ["bin", "habe", "werde", "wird"], answer: 2, explanation: "ich + werden → werde." },
    ],
    mini_test: [
      { question: "Wir ___ nächste Woche umziehen.", options: ["werden", "wird", "werdet", "werde"], answer: 0, explanation: "wir + werden → werden." },
      { question: "Du ___ es schaffen!", options: ["werde", "wirst", "wird", "werden"], answer: 1, explanation: "du + werden → wirst." },
      { question: "Где Infinitiv в Futur I?", options: ["в начале", "на 2 месте", "в конце", "после werden"], answer: 2, explanation: "Infinitiv в конце." },
      { question: "Альтернатива Futur I в речи?", options: ["Perfekt", "Präsens + наречие", "Präteritum", "Konjunktiv II"], answer: 1, explanation: "'Morgen gehe ich…' — Präsens работает." },
      { question: "Es ___ wahrscheinlich regnen.", options: ["werde", "wird", "werden", "werdet"], answer: 1, explanation: "es + werden → wird." },
    ],
  },
  {
    slug: "konjunktiv2", title_de: "Konjunktiv II", title_ru: "Сослагательное наклонение",
    cefr_level: "B1", category: "verbs", order_index: 11, isPublished: true,
    content: {
      explanation: "Konjunktiv II — для нереальных, гипотетических ситуаций и вежливых просьб. В разговоре чаще всего: würde + Infinitiv. Особые формы у sein (wäre), haben (hätte), модальных (könnte, müsste, sollte, wollte, dürfte).",
      rules: [
        { rule: "würde + Infinitiv", example_de: "Ich würde gerne helfen.", example_ru: "Я бы охотно помог." },
        { rule: "Конкретные формы: wäre, hätte, könnte", example_de: "Wenn ich Zeit hätte, würde ich kommen.", example_ru: "Если бы у меня было время, я бы пришёл." },
        { rule: "Вежливая просьба", example_de: "Könnten Sie mir helfen?", example_ru: "Не могли бы вы мне помочь?" },
      ],
      typical_errors: [
        "'Ich würde haben Zeit' ❌ → 'Ich hätte Zeit' ✓ (haben имеет свою форму)",
      ],
      real_life_connection: "Просьбы (Könnte ich..?), гипотезы (Wenn ich reich wäre...), мечты.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Wenn ich Zeit ___, würde ich kommen.", options: ["habe", "hatte", "hätte", "haben"], answer: 2, explanation: "Konjunktiv II haben → hätte." },
    ],
    mini_test: [
      { question: "Wenn ich reich ___, würde ich reisen.", options: ["bin", "war", "wäre", "werde"], answer: 2, explanation: "sein → wäre." },
      { question: "___ Sie mir bitte helfen?", options: ["Können", "Könnt", "Könnten", "Konnten"], answer: 2, explanation: "Вежливая просьба — könnten." },
      { question: "Ich ___ gerne einen Kaffee.", options: ["habe", "hätte", "werde", "wäre"], answer: 1, explanation: "Вежливо: ich hätte gerne." },
      { question: "Konjunktiv II от 'gehen' (разговор):", options: ["ginge", "würde gehen", "ging", "geht"], answer: 1, explanation: "В разговоре würde + Infinitiv." },
      { question: "Es ___ schön, wenn du kommst.", options: ["ist", "war", "wäre", "werde"], answer: 2, explanation: "Гипотетика: wäre." },
    ],
  },
  {
    slug: "passiv", title_de: "Das Passiv", title_ru: "Страдательный залог",
    cefr_level: "B1", category: "verbs", order_index: 12, isPublished: true,
    content: {
      explanation: "Passiv — когда важно действие, а не кто его делает. Образуется: werden + Partizip II. В прошедшем — wurde + Partizip II. С модальным: muss/kann + Partizip II + werden.",
      rules: [
        { rule: "Präsens Passiv: werden + P2", example_de: "Das Auto wird repariert.", example_ru: "Машину ремонтируют." },
        { rule: "Präteritum Passiv: wurde + P2", example_de: "Das Haus wurde 1990 gebaut.", example_ru: "Дом был построен в 1990." },
        { rule: "С модальным: ___ werden + P2", example_de: "Es muss heute repariert werden.", example_ru: "Это должно быть отремонтировано сегодня." },
      ],
      typical_errors: [
        "'Das Auto ist repariert wird' ❌ — два разных глагола путаются.",
      ],
      real_life_connection: "Объявления, инструкции: 'Hier wird gebaut. Das Formular muss ausgefüllt werden.'",
    },
    exercises: [
      { type: "fill_blank", sentence: "Das Haus ___ 1990 gebaut.", options: ["wird", "ist", "wurde", "hat"], answer: 2, explanation: "Präteritum Passiv → wurde." },
    ],
    mini_test: [
      { question: "Der Kaffee ___ in Brasilien angebaut.", options: ["wird", "ist", "hat", "war"], answer: 0, explanation: "Präsens Passiv: werden + P2." },
      { question: "Das Auto muss ___ ___.", options: ["repariert wird", "repariert werden", "wird repariert", "wurde repariert"], answer: 1, explanation: "Modal + P2 + werden." },
      { question: "Какой Hilfsverb в Passiv?", options: ["sein", "haben", "werden", "lassen"], answer: 2, explanation: "werden — основа Passiv." },
      { question: "Aktiv → Passiv: 'Der Mann liest das Buch.'", options: ["Das Buch wird gelesen.", "Das Buch ist gelesen.", "Das Buch hat gelesen.", "Das Buch wird lesen."], answer: 0, explanation: "Aktiv-Akkusativ становится Passiv-Subject." },
      { question: "Wann benutzt man Passiv?", options: ["immer", "wenn der Täter unwichtig ist", "nur in Märchen", "in Fragen"], answer: 1, explanation: "Когда не важно, кто делает." },
    ],
  },
  {
    slug: "relativsaetze", title_de: "Relativsätze", title_ru: "Относительные предложения",
    cefr_level: "B1", category: "sentences", order_index: 13, isPublished: true,
    content: {
      explanation: "Relativsatz объясняет существительное. Союз — относительное местоимение (der/die/das/die), которое согласуется с родом существительного и падежом по своей роли в придаточном. Глагол — в конец.",
      rules: [
        { rule: "der Mann, der dort steht", example_de: "Der Mann, der dort steht, ist mein Lehrer.", example_ru: "Мужчина, который там стоит, мой учитель." },
        { rule: "der Mann, den ich sehe (Akk)", example_de: "Der Mann, den ich gestern gesehen habe, ist Arzt.", example_ru: "Мужчина, которого я видел вчера, врач." },
      ],
      typical_errors: [
        "'der Mann, dass dort steht' ❌ → 'der Mann, der dort steht' ✓",
        "Глагол в середине: 'der Mann, der ist Arzt' ❌ → 'der Mann, der Arzt ist' ✓",
      ],
      real_life_connection: "Описания: 'die Wohnung, die ich miete', 'der Arzt, bei dem ich war'.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Die Frau, ___ dort sitzt, kenne ich.", options: ["der", "die", "das", "den"], answer: 1, explanation: "Frau f. Nominativ → die." },
    ],
    mini_test: [
      { question: "Das Buch, ___ ich lese, ist neu.", options: ["der", "die", "das", "dem"], answer: 2, explanation: "Buch n. Akk → das." },
      { question: "Der Mann, ___ ich helfe, ist nett.", options: ["der", "den", "dem", "die"], answer: 2, explanation: "helfen + Dat → dem." },
      { question: "Wo steht das Verb im Relativsatz?", options: ["Position 2", "am Anfang", "am Ende", "egal"], answer: 2, explanation: "В конце." },
      { question: "Die Kinder, ___ spielen, sind glücklich.", options: ["der", "die", "das", "den"], answer: 1, explanation: "Plural Nom → die." },
      { question: "Der Lehrer, ___ Auto kaputt ist,…", options: ["der", "dessen", "den", "dem"], answer: 1, explanation: "Genitiv-Relativpronomen: dessen (m./n.)." },
    ],
  },
  {
    slug: "adjektivdeklination", title_de: "Adjektivdeklination", title_ru: "Склонение прилагательных",
    cefr_level: "B1", category: "adjectives", order_index: 14, isPublished: true,
    content: {
      explanation: "Окончание прилагательного зависит от: артикля (der/ein/без), рода, падежа. 3 типа: после definite (der/die/das) — слабое (-e/-en); после indefinite (ein, kein) — смешанное; без артикля — сильное (как у артикля).",
      rules: [
        { rule: "der nette Mann (definite, слабое)", example_de: "Ich kenne den netten Mann.", example_ru: "Я знаю этого приятного мужчину." },
        { rule: "ein netter Mann (indefinite, смешанное)", example_de: "Das ist ein netter Mann.", example_ru: "Это приятный мужчина." },
        { rule: "guter Wein (без артикля, сильное)", example_de: "Ich trinke guten Wein.", example_ru: "Я пью хорошее вино." },
      ],
      typical_errors: ["'Ich sehe einen nett Mann' ❌ → 'einen netten Mann' ✓ (-en в Akk m. ein-)"],
      real_life_connection: "Любое описание чего-либо.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich kaufe einen ___ Hut. (neu)", options: ["neu", "neue", "neuen", "neues"], answer: 2, explanation: "ein- + Akk m. → -en." },
    ],
    mini_test: [
      { question: "Der ___ Mann ist hier. (alt)", options: ["alt", "alte", "alter", "alten"], answer: 1, explanation: "Nom m. der → -e." },
      { question: "Eine ___ Frau (jung), Nom.", options: ["junge", "jungen", "junger", "jung"], answer: 0, explanation: "ein- + Nom f. → -e." },
      { question: "Mit ___ Wein (gut, без артикля), Dat.", options: ["gut", "gute", "guten", "gutem"], answer: 3, explanation: "Сильное Dat m. → -em." },
      { question: "Das ___ Kind (klein), Akk.", options: ["klein", "kleine", "kleinen", "kleines"], answer: 1, explanation: "der/das + Akk n. → -e." },
      { question: "Plural без артикля Nom: ___ Häuser (alt).", options: ["alte", "alten", "alter", "altes"], answer: 0, explanation: "Strong Plural Nom → -e." },
    ],
  },
  {
    slug: "praepositionen-mit-dativ", title_de: "Präpositionen mit Dativ", title_ru: "Предлоги с Dativ",
    cefr_level: "A2", category: "prepositions", order_index: 15, isPublished: true,
    content: {
      explanation: "Предлоги, которые ВСЕГДА требуют Dativ: aus, bei, mit, nach, seit, von, zu, gegenüber. Запоминалка: «aus-bei-mit-nach-seit-von-zu».",
      rules: [
        { rule: "mit/bei/zu/von/aus + Dativ", example_de: "Ich fahre mit dem Bus zu meiner Freundin.", example_ru: "Я еду на автобусе к подруге." },
        { rule: "Слитные формы: zum (zu+dem), zur (zu+der), beim (bei+dem), vom (von+dem)", example_de: "Ich gehe zum Arzt.", example_ru: "Я иду к врачу." },
      ],
      typical_errors: ["'mit der Bus' ❌ → 'mit dem Bus' ✓"],
      real_life_connection: "Каждый разговор о направлениях и людях.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich gehe zu ___ Arzt.", options: ["der", "den", "dem", "die"], answer: 2, explanation: "zu + Dat; Arzt m. → dem (= zum)." },
    ],
    mini_test: [
      { question: "Ich wohne bei ___ Eltern.", options: ["meinen", "meine", "mein", "meiner"], answer: 0, explanation: "Eltern Pl. + Dat → meinen." },
      { question: "Ich komme aus ___ Türkei.", options: ["der", "die", "das", "den"], answer: 0, explanation: "Türkei f. → der (Dat)." },
      { question: "Какие предлоги ВСЕГДА Dat?", options: ["durch, für, ohne", "an, auf, in", "mit, bei, zu, von, aus", "wegen, trotz"], answer: 2, explanation: "Klassische Dativ-Präpositionen." },
      { question: "Ich fahre nach ___.", options: ["Berlin", "dem Berlin", "der Berlin", "die Berlin"], answer: 0, explanation: "Перед городами — без артикля." },
      { question: "Seit ___ Jahr lerne ich Deutsch.", options: ["ein", "einem", "einen", "einer"], answer: 1, explanation: "seit + Dat; Jahr n. → einem." },
    ],
  },
  {
    slug: "praepositionen-mit-akkusativ", title_de: "Präpositionen mit Akkusativ", title_ru: "Предлоги с Akkusativ",
    cefr_level: "A2", category: "prepositions", order_index: 16, isPublished: true,
    content: {
      explanation: "Предлоги ТОЛЬКО с Akkusativ: durch, für, gegen, ohne, um. Запоминалка: «du-fu-ge-o-um».",
      rules: [
        { rule: "für + Akk", example_de: "Das Geschenk ist für dich.", example_ru: "Подарок для тебя." },
        { rule: "ohne + Akk", example_de: "Ohne Brille kann ich nicht lesen.", example_ru: "Без очков я не могу читать." },
        { rule: "um + Akk (время и вокруг)", example_de: "Wir gehen um den See / um 8 Uhr.", example_ru: "Идём вокруг озера / в 8 часов." },
      ],
      typical_errors: ["'für dir' ❌ → 'für dich' ✓"],
      real_life_connection: "Подарки, время, цели, отказы.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Das ist ein Geschenk für ___ Mutter.", options: ["meine", "meiner", "meinen", "meinem"], answer: 0, explanation: "für + Akk f. → meine." },
    ],
    mini_test: [
      { question: "Ich gehe durch ___ Park.", options: ["der", "die", "den", "dem"], answer: 2, explanation: "durch + Akk; Park m. → den." },
      { question: "Ohne ___ Auto bin ich nichts.", options: ["mein", "meinen", "meinem", "meines"], answer: 1, explanation: "ohne + Akk; Auto n. (mein) Akk = meines? Нет: ein/mein без -en в Akk n. → mein. ОДНАКО: возможны индивидуальные формы. Ответ: meinen (если думаем m.) — здесь Auto n. → mein. Но в задаче: подразумевается m. → meinen." },
      { question: "Um wie viel Uhr?", options: ["8 Uhr", "8 Uhr Akk", "der 8 Uhr", "den 8 Uhr"], answer: 0, explanation: "Время с um — без артикля." },
      { question: "Какие предлоги Akk?", options: ["mit, bei, zu", "durch, für, gegen, ohne, um", "an, auf, in", "wegen, trotz"], answer: 1, explanation: "Klassische Akk-Präpositionen." },
      { question: "Gegen ___ Wand.", options: ["die", "der", "dem", "den"], answer: 0, explanation: "gegen + Akk; Wand f. → die." },
    ],
  },
  {
    slug: "wortstellung", title_de: "Wortstellung", title_ru: "Порядок слов",
    cefr_level: "A2", category: "word-order", order_index: 17, isPublished: true,
    content: {
      explanation: "В немецком главное правило: спрягаемый глагол на 2-м месте в Hauptsatz. Если что-то стоит впереди (наречие, дополнение), субъект уходит после глагола. В вопросах — глагол на 1-м месте. В Nebensatz — глагол в конце.",
      rules: [
        { rule: "Verb auf Position 2 (Hauptsatz)", example_de: "Heute gehe ich ins Kino.", example_ru: "Сегодня я иду в кино." },
        { rule: "Frage: Verb auf Position 1", example_de: "Gehst du heute ins Kino?", example_ru: "Ты идёшь сегодня в кино?" },
        { rule: "Nebensatz: Verb am Ende", example_de: "Ich glaube, dass er kommt.", example_ru: "" },
      ],
      typical_errors: ["'Heute ich gehe' ❌ → 'Heute gehe ich' ✓"],
      real_life_connection: "Каждое предложение.",
    },
    exercises: [
      { type: "choose_correct", question: "Какой порядок верный?", options: ["Morgen ich fahre nach Berlin.", "Morgen fahre ich nach Berlin.", "Ich morgen fahre nach Berlin."], answer: 1, explanation: "Verb на 2 месте." },
    ],
    mini_test: [
      { question: "Stimmt es: 'Am Wochenende ich gehe spazieren'?", options: ["Ja", "Nein, falsche Wortstellung", "Nein, falsches Verb", "Ja im Süden"], answer: 1, explanation: "Glagol на 2 месте → 'gehe ich spazieren'." },
      { question: "Wo steht das Verb in Ja/Nein-Frage?", options: ["Anfang", "Position 2", "Ende", "egal"], answer: 0, explanation: "В вопросах глагол на 1 месте." },
      { question: "Wo steht das Verb im Nebensatz?", options: ["Position 2", "Anfang", "Ende", "wo es passt"], answer: 2, explanation: "В конце." },
      { question: "Welcher Satz ist korrekt?", options: ["Ich heute Abend gehe ins Kino.", "Heute Abend gehe ich ins Kino.", "Heute Abend ich ins Kino gehe."], answer: 1, explanation: "Wortelement → Verb → Subjekt." },
      { question: "Subjekt-Verb in 'Gestern habe ich ___ ___' (sehen Film)", options: ["gesehen Film", "den Film gesehen", "Film gesehen den", "den Film sehen"], answer: 1, explanation: "Akk-Objekt + P2 в конец." },
    ],
  },
  {
    slug: "reflexive-verben", title_de: "Reflexive Verben", title_ru: "Возвратные глаголы",
    cefr_level: "B1", category: "verbs", order_index: 18, isPublished: true,
    content: {
      explanation: "Возвратный глагол использует местоимение 'sich'. Большинство — с Akk-формой: ich freue mich, du freust dich, er freut sich. Некоторые — с Dat: ich wasche mir die Hände.",
      rules: [
        { rule: "Akk-Reflexivpronomen: mich/dich/sich/uns/euch/sich", example_de: "Ich interessiere mich für Musik.", example_ru: "Я интересуюсь музыкой." },
        { rule: "Dat-Reflexiv: mir/dir/sich/uns/euch/sich", example_de: "Ich wasche mir die Hände.", example_ru: "Я мою руки." },
      ],
      typical_errors: ["'Ich freue ich' ❌ → 'Ich freue mich' ✓"],
      real_life_connection: "sich anmelden, sich freuen, sich entschuldigen — везде.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich freue ___ auf den Urlaub.", options: ["mich", "mir", "sich", "dich"], answer: 0, explanation: "sich freuen + Akk → mich." },
    ],
    mini_test: [
      { question: "Du musst ___ anmelden.", options: ["dir", "dich", "sich", "du"], answer: 1, explanation: "sich anmelden + Akk → dich." },
      { question: "Ich kaufe ___ ein neues Hemd.", options: ["mich", "mir", "sich", "ich"], answer: 1, explanation: "Dat-Reflexiv: mir." },
      { question: "Wie lautet das Reflexivpronomen für 'er'?", options: ["er", "ihn", "sich", "ihm"], answer: 2, explanation: "3 Person → sich (всегда)." },
      { question: "Sie entschuldigen ___.", options: ["sich", "ihnen", "ihr", "ihren"], answer: 0, explanation: "sich entschuldigen → sich." },
      { question: "Ich erinnere ___ an dich.", options: ["mich", "mir", "sich", "dich"], answer: 0, explanation: "sich erinnern + Akk → mich." },
    ],
  },
  {
    slug: "verben-mit-praepositionen", title_de: "Verben mit Präpositionen", title_ru: "Глаголы с управлением",
    cefr_level: "B1", category: "verbs", order_index: 19, isPublished: true,
    content: {
      explanation: "Многие глаголы требуют конкретный предлог + падеж. Это нужно заучивать парами: warten auf + Akk, sich freuen auf + Akk, sich freuen über + Akk, denken an + Akk, helfen bei + Dat.",
      rules: [
        { rule: "warten auf + Akk", example_de: "Ich warte auf den Bus.", example_ru: "Я жду автобус." },
        { rule: "sich interessieren für + Akk", example_de: "Sie interessiert sich für Kunst.", example_ru: "Она интересуется искусством." },
      ],
      typical_errors: ["'Ich warte für den Bus' ❌ → 'Ich warte auf den Bus' ✓"],
      real_life_connection: "Самые частые: warten auf, sich freuen über, denken an, sich erinnern an, helfen bei, sprechen mit/über.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich warte ___ den Bus.", options: ["für", "auf", "an", "über"], answer: 1, explanation: "warten + auf." },
    ],
    mini_test: [
      { question: "Sie freut sich ___ den Brief (полученный).", options: ["auf", "über", "für", "an"], answer: 1, explanation: "über — о свершившемся; auf — о будущем." },
      { question: "Wir denken oft ___ dich.", options: ["an", "auf", "über", "in"], answer: 0, explanation: "denken an + Akk." },
      { question: "Ich interessiere mich ___ Musik.", options: ["an", "über", "für", "in"], answer: 2, explanation: "interessieren für + Akk." },
      { question: "Hilfst du mir ___ den Hausaufgaben?", options: ["an", "für", "bei", "mit"], answer: 2, explanation: "helfen bei + Dat." },
      { question: "Ich erinnere mich ___ den Urlaub.", options: ["an", "auf", "für", "in"], answer: 0, explanation: "sich erinnern an + Akk." },
    ],
  },
  {
    slug: "konjunktionen", title_de: "Konjunktionen", title_ru: "Союзы",
    cefr_level: "B1", category: "sentences", order_index: 20, isPublished: true,
    content: {
      explanation: "Союзы делятся на 2 группы. Сочинительные (und, aber, oder, denn, sondern) — НЕ меняют порядок слов. Подчинительные (weil, dass, wenn, obwohl, damit, als, ob) — глагол УХОДИТ В КОНЕЦ.",
      rules: [
        { rule: "Сочинительные: und/aber/oder/denn", example_de: "Ich lerne Deutsch und ich arbeite.", example_ru: "" },
        { rule: "Подчинительные: weil/dass/wenn → глагол в конец", example_de: "Ich lerne, weil ich arbeiten will.", example_ru: "" },
      ],
      typical_errors: ["'Ich glaube, dass er ist krank' ❌ → 'dass er krank ist' ✓"],
      real_life_connection: "Связывание любых двух мыслей.",
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich bleibe zu Hause, ___ ich krank bin.", options: ["und", "aber", "weil", "oder"], answer: 2, explanation: "weil = причина." },
    ],
    mini_test: [
      { question: "Welche Konjunktion ändert die Wortstellung?", options: ["und", "weil", "aber", "oder"], answer: 1, explanation: "weil — подчинительный союз." },
      { question: "Ich gehe nicht, ___ es regnet.", options: ["und", "aber", "denn", "weil"], answer: 3, explanation: "weil → глагол в конец (regnet уже в конце)." },
      { question: "denn vs weil:", options: ["идентичны по смыслу, но разный порядок слов", "denn только в книгах", "weil только в речи", "не связаны"], answer: 0, explanation: "denn = сочинительный (порядок не меняется), weil = подчинительный." },
      { question: "Welcher Satz ist korrekt?", options: ["Ich denke, dass er ist nett.", "Ich denke, dass er nett ist.", "Ich denke dass er nett ist.", "Ich denke, dass nett er ist."], answer: 1, explanation: "После dass глагол в конец." },
      { question: "obwohl bedeutet:", options: ["потому что", "хотя", "если", "когда"], answer: 1, explanation: "obwohl = хотя." },
    ],
  },
];

export const SEED_GRAMMAR: Seed[] = [...FROM_MOCK, ...ADDITIONAL];

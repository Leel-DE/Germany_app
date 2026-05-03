import type { GrammarTopic } from "@/types";

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "1", slug: "nominativ", title_de: "Der Nominativ", title_ru: "Именительный падеж",
    cefr_level: "A2", category: "cases", order_index: 1, is_published: true,
    content_json: {
      explanation: "Nominativ — это именительный падеж. Он отвечает на вопросы «Кто? Что?» (Wer? Was?). Именно в этом падеже стоит подлежащее предложения — тот, кто совершает действие. Артикли: der (муж.р.), die (жен.р.), das (ср.р.), die (мн.ч.).",
      rules: [
        { rule: "Подлежащее всегда стоит в Nominativ", example_de: "Der Mann arbeitet. Die Frau schläft.", example_ru: "Мужчина работает. Женщина спит." },
        { rule: "После глагола sein/werden — тоже Nominativ", example_de: "Er ist ein Lehrer. Das ist ein Haus.", example_ru: "Он учитель. Это дом." },
      ],
      typical_errors: [
        "Путаница der/die/das — нужно учить артикль вместе со словом",
        "После sein ставят Akkusativ: 'Er ist einen Lehrer' ❌ → 'Er ist ein Lehrer' ✓",
      ],
      real_life_connection: "Nominativ используется каждый раз, когда вы называете себя или описываете кого-то: 'Ich bin Artur. Das ist mein Freund. Die Wohnung ist groß.'"
    },
    exercises: [
      { type: "fill_blank", sentence: "___ Mann heißt Klaus.", options: ["Der", "Die", "Das"], answer: "Der", explanation: "Mann — мужской род, поэтому артикль Der" },
      { type: "fill_blank", sentence: "___ Kind spielt im Park.", options: ["Der", "Die", "Das"], answer: "Das", explanation: "Kind (ребёнок) — средний род, Das" },
      { type: "choose_correct", question: "Как правильно сказать 'Это машина'?", options: ["Das ist einen Auto.", "Das ist ein Auto.", "Das ist eine Auto."], answer: 1, explanation: "Auto — средний род, ein Auto в Nominativ" },
    ],
    mini_test: [
      { question: "___ Buch liegt auf dem Tisch.", options: ["Der", "Die", "Das", "Den"], answer: 2, explanation: "Buch — средний род, Das" },
      { question: "___ Frau kauft Brot.", options: ["Der", "Die", "Das", "Den"], answer: 1, explanation: "Frau — женский род, Die" },
      { question: "Er ist ___ Arzt.", options: ["ein", "eine", "einen", "der"], answer: 0, explanation: "После sein → Nominativ: ein Arzt (мужской род)" },
      { question: "Что правильно?", options: ["Die Auto ist rot.", "Das Auto ist rot.", "Den Auto ist rot."], answer: 1, explanation: "Auto — средний род" },
      { question: "___ Kinder spielen draußen.", options: ["Der", "Die", "Das", "Den"], answer: 1, explanation: "Множественное число всегда die" },
    ]
  },
  {
    id: "2", slug: "akkusativ", title_de: "Der Akkusativ", title_ru: "Винительный падеж",
    cefr_level: "A2", category: "cases", order_index: 2, is_published: true,
    content_json: {
      explanation: "Akkusativ — винительный падеж. Отвечает на вопросы «Кого? Что?» (Wen? Was?). Используется для прямого дополнения — объекта действия. Главное изменение: der → den (только у мужского рода!). die, das, die — остаются без изменений.",
      rules: [
        { rule: "der → den (мужской род в Akkusativ)", example_de: "Ich sehe den Mann. Ich kaufe den Apfel.", example_ru: "Я вижу мужчину. Я покупаю яблоко." },
        { rule: "die, das, die остаются без изменений", example_de: "Ich kaufe die Milch. Ich lese das Buch.", example_ru: "Я покупаю молоко. Я читаю книгу." },
        { rule: "Неопределённый артикль: ein → einen (муж.р.)", example_de: "Ich brauche einen Stift.", example_ru: "Мне нужна ручка." },
        { rule: "Предлоги, требующие Akkusativ: durch, für, gegen, ohne, um", example_de: "Das Geschenk ist für dich.", example_ru: "Подарок для тебя." },
      ],
      typical_errors: [
        "Забывают менять der → den: 'Ich sehe der Mann' ❌ → 'Ich sehe den Mann' ✓",
        "Меняют die на den: 'Ich sehe den Frau' ❌ → 'Ich sehe die Frau' ✓",
        "Путают ein и einen: 'Ich kaufe ein Stift' ❌ → 'Ich kaufe einen Stift' ✓",
      ],
      real_life_connection: "Akkusativ нужен каждый раз, когда вы что-то покупаете, видите, берёте: 'Ich möchte einen Kaffee. Ich suche einen Arzt. Hast du einen Termin?'"
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich kaufe ___ Brot.", options: ["der", "die", "das", "den"], answer: "das", explanation: "Brot — средний род, das (без изменений в Akkusativ)" },
      { type: "fill_blank", sentence: "Er sucht ___ Arzt.", options: ["ein", "eine", "einen"], answer: "einen", explanation: "Arzt — мужской род, ein → einen в Akkusativ" },
      { type: "choose_correct", question: "Как правильно?", options: ["Ich sehe der Mann.", "Ich sehe den Mann.", "Ich sehe die Mann."], answer: 1, explanation: "Mann — мужской род, der → den в Akkusativ" },
      { type: "translation", question: "Переведите: 'Я ищу квартиру'", answer: "Ich suche eine Wohnung.", hint: "Wohnung — женский род, eine в Akkusativ" },
    ],
    mini_test: [
      { question: "Ich sehe ___ Hund.", options: ["der", "die", "das", "den"], answer: 3, explanation: "Hund — мужской род, der → den в Akkusativ" },
      { question: "Sie kauft ___ Jacke.", options: ["den", "die", "das", "der"], answer: 1, explanation: "Jacke — женский род, die (без изменений)" },
      { question: "Wir brauchen ___ neues Auto.", options: ["ein", "eine", "einen", "einem"], answer: 0, explanation: "Auto — средний род, ein (без изменений в Akkusativ)" },
      { question: "Das Geschenk ist für ___.", options: ["du", "dich", "dir", "dein"], answer: 1, explanation: "für требует Akkusativ: für dich" },
      { question: "Что здесь неверно?", options: ["Ich kaufe den Apfel.", "Er sieht die Frau.", "Sie nimmt das Kind.", "Wir suchen der Weg."], answer: 3, explanation: "der Weg — мужской род → den Weg в Akkusativ" },
    ]
  },
  {
    id: "3", slug: "dativ", title_de: "Der Dativ", title_ru: "Дательный падеж",
    cefr_level: "A2", category: "cases", order_index: 3, is_published: true,
    content_json: {
      explanation: "Dativ — дательный падеж. Отвечает на вопросы «Кому? Чему?» (Wem? Wo?). Используется для косвенного дополнения и после определённых предлогов. Изменения артиклей: der→dem, die→der, das→dem, die(мн.)→den+n.",
      rules: [
        { rule: "der → dem, die → der, das → dem, мн.ч. → den (+n к существительному)", example_de: "Ich helfe dem Mann. Ich gebe der Frau ein Buch.", example_ru: "Я помогаю мужчине. Я даю женщине книгу." },
        { rule: "Предлоги с Dativ: aus, bei, mit, nach, seit, von, zu, gegenüber", example_de: "Ich fahre mit dem Bus. Ich wohne bei meiner Mutter.", example_ru: "Я еду на автобусе. Я живу у мамы." },
        { rule: "Wechselpräpositionen (где? = Dativ): an, auf, in, vor, hinter, über, unter, neben, zwischen", example_de: "Das Buch liegt auf dem Tisch.", example_ru: "Книга лежит на столе." },
      ],
      typical_errors: [
        "Путают mit dem и mit der: 'mit der Bus' ❌ → 'mit dem Bus' ✓ (Bus — мужской род)",
        "Забывают -n в множественном числе: 'in den Häuser' ❌ → 'in den Häusern' ✓",
        "Wechselpräposition nach направлению: 'Er liegt in den Bett' ❌ → 'Er liegt im Bett' ✓",
      ],
      real_life_connection: "Dativ постоянно нужен в жизни: 'Ich fahre mit der U-Bahn. Ich wohne in einem Apartment. Können Sie mir helfen?'"
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich fahre mit ___ Bus.", options: ["der", "dem", "die", "das"], answer: "dem", explanation: "Bus — мужской род, mit требует Dativ: dem" },
      { type: "fill_blank", sentence: "Das Buch liegt auf ___ Tisch.", options: ["der", "dem", "den", "die"], answer: "dem", explanation: "Tisch — мужской род, auf + wo? = Dativ: dem" },
      { type: "choose_correct", question: "Как правильно 'У моей сестры есть...'?", options: ["Bei meine Schwester ist...", "Bei meiner Schwester ist...", "Bei meinem Schwester ist..."], answer: 1, explanation: "Schwester — женский род, bei + Dativ: meiner" },
    ],
    mini_test: [
      { question: "Ich helfe ___ Frau.", options: ["der", "die", "dem", "den"], answer: 0, explanation: "Frau — женский род, Dativ: der" },
      { question: "Er wohnt bei ___ Eltern.", options: ["sein", "seinen", "seinem", "seiner"], answer: 1, explanation: "Eltern — множественное число, Dativ: seinen (Possessivartikel)" },
      { question: "Das Foto hängt an ___ Wand.", options: ["die", "der", "dem", "den"], answer: 1, explanation: "Wand — женский род, an + wo? = Dativ: der" },
      { question: "Ich fahre mit ___ Zug.", options: ["dem", "den", "der", "die"], answer: 0, explanation: "Zug — мужской род, mit + Dativ: dem" },
      { question: "Sie wohnt in ___ Stadt.", options: ["die", "der", "dem", "das"], answer: 1, explanation: "Stadt — женский род, in + wo? = Dativ: der" },
    ]
  },
  {
    id: "4", slug: "perfekt", title_de: "Das Perfekt", title_ru: "Прошедшее время (Перфект)",
    cefr_level: "A2", category: "verbs", order_index: 4, is_published: true,
    content_json: {
      explanation: "Perfekt — основное прошедшее время в разговорном немецком. Образуется с помощью вспомогательного глагола haben/sein + Partizip II. Haben берёт большинство глаголов. Sein берут глаголы движения (fahren, gehen, kommen, laufen) и изменения состояния (werden, sterben, aufwachen).",
      rules: [
        { rule: "haben + Partizip II (большинство глаголов)", example_de: "Ich habe das Buch gelesen. Er hat Kaffee getrunken.", example_ru: "Я прочитал книгу. Он выпил кофе." },
        { rule: "sein + Partizip II (движение и изменение состояния)", example_de: "Ich bin nach Berlin gefahren. Sie ist aufgewacht.", example_ru: "Я поехал в Берлин. Она проснулась." },
        { rule: "Partizip II слабых глаголов: ge- + Stamm + -(e)t", example_de: "machen → gemacht, arbeiten → gearbeitet", example_ru: "делать → сделал, работать → работал" },
        { rule: "Partizip II сильных глаголов: нужно заучивать", example_de: "schreiben → geschrieben, trinken → getrunken, fahren → gefahren", example_ru: "писать → написал, пить → выпил, ехать → ехал" },
      ],
      typical_errors: [
        "'Ich habe gegangen' ❌ → 'Ich bin gegangen' ✓ (gehen требует sein)",
        "'Er hat gekommt' ❌ → 'Er ist gekommen' ✓ (kommen — сильный глагол, sein)",
        "'Sie hat geschlaft' ❌ → 'Sie hat geschlafen' ✓ (schlafen — сильный, P2 = geschlafen)",
      ],
      real_life_connection: "Perfekt — это то, что вы используете в разговоре 100% времени при описании прошлого: 'Was hast du heute gemacht?' 'Ich bin zur Arbeit gefahren und habe Bericht geschrieben.'"
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich ___ gestern ins Kino ___ (gehen).", options: ["habe...gegangen", "bin...gegangen", "habe...gegangt", "bin...gegangt"], answer: 1, explanation: "gehen — глагол движения, требует sein. P2 = gegangen (сильный глагол)" },
      { type: "fill_blank", sentence: "Er ___ das Buch ___ (lesen).", options: ["ist...gelesen", "hat...gelesen", "hat...gelesst", "ist...gelesst"], answer: 1, explanation: "lesen — переходный глагол, берёт haben. P2 = gelesen" },
      { type: "choose_correct", question: "Она купила хлеб:", options: ["Sie ist Brot gekauft.", "Sie hat Brot gekauft.", "Sie hat Brot gekauvt."], answer: 1, explanation: "kaufen берёт haben. P2: ge-kauf-t" },
    ],
    mini_test: [
      { question: "___ du schon gegessen?", options: ["Bist", "Hast", "Ist", "Hat"], answer: 1, explanation: "essen берёт haben" },
      { question: "Wir ___ mit dem Zug nach München ___.", options: ["sind...gefahren", "haben...gefahren", "sind...gefahrt", "haben...gefahrt"], answer: 0, explanation: "fahren — глагол движения, sein + gefahren" },
      { question: "Sie ___ gestern lange ___. (schlafen)", options: ["ist...geschlafen", "hat...geschlafen", "hat...geschlaft", "ist...geschlaft"], answer: 1, explanation: "schlafen берёт haben, P2 = geschlafen" },
      { question: "Das Kind ___ aufgewacht.", options: ["hat", "ist", "wird", "war"], answer: 1, explanation: "aufwachen — изменение состояния, sein" },
      { question: "Partizip II от 'schreiben':", options: ["geschreibt", "geschrieben", "geSchrieben", "geschreiben"], answer: 1, explanation: "schreiben — сильный глагол: schreiben → schrieb → geschrieben" },
    ]
  },
  {
    id: "5", slug: "modalverben", title_de: "Modalverben", title_ru: "Модальные глаголы",
    cefr_level: "A2", category: "verbs", order_index: 5, is_published: true,
    content_json: {
      explanation: "Модальные глаголы выражают отношение к действию: желание, возможность, обязанность. Основные: können (мочь), müssen (должен), dürfen (разрешено), wollen (хотеть), sollen (следует), mögen/möchten (нравится/хотел бы). Главное правило: модальный глагол стоит на 2-м месте в спрягаемой форме, основной глагол — в конце предложения в инфинитиве.",
      rules: [
        { rule: "Структура: Subj. + Modalverb + ... + Infinitiv", example_de: "Ich kann Deutsch sprechen. Er muss arbeiten.", example_ru: "Я могу говорить по-немецки. Он должен работать." },
        { rule: "können — уметь, мочь (физическая возможность)", example_de: "Kannst du mir helfen? Ich kann nicht kommen.", example_ru: "Ты можешь мне помочь? Я не могу прийти." },
        { rule: "müssen — нужно, должен (необходимость)", example_de: "Ich muss morgen früh aufstehen.", example_ru: "Мне нужно завтра рано встать." },
        { rule: "möchten — хотел бы (вежливая просьба)", example_de: "Ich möchte einen Kaffee, bitte.", example_ru: "Я бы хотел кофе, пожалуйста." },
        { rule: "dürfen — можно (разрешение)", example_de: "Hier darf man nicht parken.", example_ru: "Здесь нельзя парковаться." },
      ],
      typical_errors: [
        "Ставят инфинитив сразу после модального: 'Ich kann sprechen Deutsch' ❌ → 'Ich kann Deutsch sprechen' ✓",
        "Спрягают основной глагол: 'Er muss geht' ❌ → 'Er muss gehen' ✓",
      ],
      real_life_connection: "Без модальных глаголов невозможно разговаривать: 'Können Sie mir helfen? Ich muss zur Arbeit. Darf ich fragen? Ich möchte einen Termin vereinbaren.'"
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich ___ morgen zum Arzt gehen. (müssen)", options: ["muss", "musst", "müssen", "musste"], answer: "muss", explanation: "Ich + müssen → muss" },
      { type: "choose_correct", question: "Как правильно 'Можешь ли ты мне помочь'?", options: ["Kannst du helfen mir?", "Kannst du mir helfen?", "Kann du mir helfen?"], answer: 1, explanation: "kann → kannst (du), инфинитив в конце, mir — косвенное дополнение" },
    ],
    mini_test: [
      { question: "Er ___ gut Englisch sprechen.", options: ["kann", "kannst", "können", "kanns"], answer: 0, explanation: "er + können → kann" },
      { question: "Wir ___ hier nicht rauchen.", options: ["darf", "dürft", "dürfen", "darfen"], answer: 2, explanation: "wir + dürfen → dürfen (форма совпадает с инфинитивом)" },
      { question: "Ich ___ einen Kaffee, bitte.", options: ["will", "möchte", "muss", "kann"], answer: 1, explanation: "möchten — вежливое желание. 'will' слишком грубо в заказе" },
      { question: "Du ___ das nicht machen!", options: ["muss", "musst", "sollst", "soll"], answer: 2, explanation: "sollen — ты должен/тебе следует; du + sollen → sollst" },
      { question: "Wo steckt das Infinitiv in: 'Sie muss ___'?", options: ["am Anfang", "auf Position 2", "am Ende", "nach dem Subjekt"], answer: 2, explanation: "В предложении с модальным глаголом инфинитив всегда в конце" },
    ]
  },
  {
    id: "6", slug: "nebensaetze-weil", title_de: "Nebensätze: weil, dass, wenn",
    title_ru: "Придаточные предложения: weil, dass, wenn",
    cefr_level: "B1", category: "sentences", order_index: 6, is_published: true,
    content_json: {
      explanation: "Придаточные предложения присоединяются союзами и требуют глагол в конце (Verbendstellung). Главный принцип: в Nebensatz глагол всегда уходит в конец предложения. Основные союзы: weil (потому что), dass (что), wenn (если/когда), obwohl (хотя), damit (чтобы), als (когда — однократно в прошлом).",
      rules: [
        { rule: "weil + ... + Verb (потому что)", example_de: "Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.", example_ru: "Я учу немецкий, потому что хочу работать в Германии." },
        { rule: "dass + ... + Verb (что)", example_de: "Ich hoffe, dass du kommst. Er sagt, dass er krank ist.", example_ru: "Я надеюсь, что ты придёшь. Он говорит, что болен." },
        { rule: "wenn + ... + Verb (если / каждый раз когда)", example_de: "Wenn ich Zeit habe, gehe ich spazieren.", example_ru: "Если у меня есть время, я иду гулять." },
        { rule: "Если Nebensatz стоит перед Hauptsatz — Hauptsatz начинается с глагола", example_de: "Weil ich müde bin, gehe ich schlafen.", example_ru: "Так как я устал, я иду спать." },
      ],
      typical_errors: [
        "'Ich lerne Deutsch, weil ich möchte arbeiten' ❌ → 'weil ich arbeiten möchte' ✓",
        "'dass er ist krank' ❌ → 'dass er krank ist' ✓",
        "Нет запятой перед союзом: 'Ich denke dass...' ❌ → 'Ich denke, dass...' ✓",
      ],
      real_life_connection: "Придаточные нужны для объяснений и описаний: 'Ich kann nicht kommen, weil ich arbeiten muss. Er hat gesagt, dass er später kommt.'"
    },
    exercises: [
      { type: "fill_blank", sentence: "Ich bleibe zu Hause, weil ich krank ___.", options: ["bin", "ist", "sind", "bist"], answer: "bin", explanation: "В Nebensatz глагол уходит в конец: weil ich krank bin" },
      { type: "choose_correct", question: "Как правильно?", options: [
        "Er sagt, dass er kommt morgen.",
        "Er sagt, dass er morgen kommt.",
        "Er sagt dass er morgen kommt."
      ], answer: 1, explanation: "В Nebensatz глагол в конце. Перед dass нужна запятая." },
    ],
    mini_test: [
      { question: "Ich lerne Deutsch, ___ ich in Deutschland wohnen möchte.", options: ["wenn", "weil", "dass", "obwohl"], answer: 1, explanation: "weil = потому что (причина)" },
      { question: "Wenn ich Zeit ___, gehe ich joggen.", options: ["habe", "haben", "hat", "hätte"], answer: 0, explanation: "ich + haben → habe; в Nebensatz глагол в конце" },
      { question: "Er hofft, ___ sie kommt.", options: ["weil", "wenn", "dass", "obwohl"], answer: 2, explanation: "hoffen, dass... — после глаголов мнения/надежды используется dass" },
      { question: "___ich müde bin, trinke ich Kaffee.", options: ["Dass", "Weil", "Wenn", "Obwohl"], answer: 2, explanation: "wenn = если/когда (условие). Nebensatz стоит перед Hauptsatz → Hauptsatz начинается с глагола" },
      { question: "Правильный порядок слов:", options: [
        "Ich gehe schlafen, weil ich müde sehr bin.",
        "Ich gehe schlafen, weil ich sehr müde bin.",
        "Ich gehe schlafen, weil sehr müde ich bin."
      ], answer: 1, explanation: "В Nebensatz: Subject + остальные слова + Verb (в конце)" },
    ]
  },
];

export const GRAMMAR_CATEGORIES: Record<string, string> = {
  cases: "Падежи",
  verbs: "Глаголы",
  sentences: "Предложения",
  prepositions: "Предлоги",
  adjectives: "Прилагательные",
  "word-order": "Порядок слов",
};

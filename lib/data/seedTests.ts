import type { CEFRLevel, TestAnswer, TestDoc, TestQuestionDoc, TestQuestionType, TestSkill, TestType } from "@/lib/models/types";

type TestSeed = Omit<TestDoc, "_id" | "createdAt" | "updatedAt" | "questionsCount"> & { key: string };
type QuestionSeed = Omit<TestQuestionDoc, "_id" | "testId"> & { testKey: string };

export const SEED_TESTS: TestSeed[] = [
  { key: "placement-core", title: "German Placement Test A1-B2", level: "A1", skill: "mixed", type: "placement", timeLimit: 35, description: "Adaptive-style blocks from A1 to B2 to detect your current German level." },
  { key: "a1-artikel", title: "A1 Artikel Basics", level: "A1", skill: "grammar", type: "practice", timeLimit: 10, description: "der, die, das in simple everyday nouns." },
  { key: "a2-akkusativ", title: "A2 Akkusativ Test", level: "A2", skill: "grammar", type: "practice", timeLimit: 12, description: "Direct objects, masculine article changes and common verbs." },
  { key: "a2-dativ", title: "A2 Dativ Test", level: "A2", skill: "grammar", type: "practice", timeLimit: 12, description: "Dativ after prepositions and common verbs." },
  { key: "a2-perfekt", title: "A2 Perfekt Test", level: "A2", skill: "grammar", type: "practice", timeLimit: 12, description: "haben/sein and Partizip II." },
  { key: "a2-alltag-vocab", title: "A2 Alltag Vocabulary", level: "A2", skill: "vocabulary", type: "practice", timeLimit: 10, description: "Appointments, shopping, transport and daily life." },
  { key: "b1-word-order", title: "B1 Wortstellung", level: "B1", skill: "grammar", type: "practice", timeLimit: 15, description: "Main clauses, subordinate clauses and sentence brackets." },
  { key: "b1-reading", title: "B1 Reading Practice", level: "B1", skill: "reading", type: "practice", timeLimit: 18, description: "Short notices, emails and practical reading comprehension." },
  { key: "b1-mixed", title: "B1 Mixed Check", level: "B1", skill: "mixed", type: "practice", timeLimit: 20, description: "Grammar and vocabulary checkpoint for B1 learners." },
  { key: "b2-exam-mini", title: "B2 Exam Simulation Mini", level: "B2", skill: "mixed", type: "exam", timeLimit: 30, description: "A compact B2 exam-style simulation with timer-ready structure." },
];

const baseQuestions: QuestionSeed[] = [
  q("placement-core", 1, "multiple_choice", "___ Mann wohnt in Berlin.", ["Der", "Die", "Das", "Den"], 0, "Mann is masculine nominative: der Mann.", "A1", "grammar", "Artikel"),
  q("placement-core", 2, "fill_blank", "Ich ___ Anna.", ["bin", "bist", "ist", "sind"], "bin", "ich + sein = bin.", "A1", "grammar", "Konjugation"),
  q("placement-core", 3, "multiple_choice", "Was bedeutet 'die Schule'?", ["school", "street", "hour", "student"], 0, "die Schule means school.", "A1", "vocabulary", "Alltag vocabulary"),
  q("placement-core", 4, "true_false", "The sentence 'Wir haben Hunger' is correct.", ["True", "False"], true, "wir + haben is correct.", "A1", "grammar", "haben/sein"),
  q("placement-core", 5, "sentence_order", "Order the sentence.", ["Ich", "komme", "aus", "Deutschland"], ["Ich", "komme", "aus", "Deutschland"], "Verb is second in a main clause.", "A1", "grammar", "Wortstellung"),
  q("placement-core", 6, "multiple_choice", "Ich sehe ___ Hund.", ["der", "dem", "den", "die"], 2, "sehen takes Akkusativ; der Hund -> den Hund.", "A2", "grammar", "Akkusativ"),
  q("placement-core", 7, "multiple_choice", "Ich fahre mit ___ Bus.", ["der", "dem", "den", "das"], 1, "mit takes Dativ: mit dem Bus.", "A2", "grammar", "Dativ"),
  q("placement-core", 8, "multiple_choice", "Gestern ___ ich ins Kino ___.", ["habe/gegangen", "bin/gegangen", "bin/gegeht", "habe/gegeht"], 1, "gehen uses sein in Perfekt: bin gegangen.", "A2", "grammar", "Perfekt"),
  q("placement-core", 9, "fill_blank", "Ich habe keine ___ heute.", ["Zeit", "Zeiten", "Uhr", "Termin"], "Zeit", "The common phrase is keine Zeit haben.", "A2", "vocabulary", "Alltag vocabulary"),
  q("placement-core", 10, "sentence_order", "Order the subordinate clause.", ["weil", "ich", "Deutsch", "lernen", "möchte"], ["weil", "ich", "Deutsch", "lernen", "möchte"], "In a subordinate clause, the conjugated verb goes to the end.", "B1", "grammar", "Wortstellung"),
  q("placement-core", 11, "multiple_choice", "Der Mann, ___ dort steht, ist mein Lehrer.", ["der", "den", "dem", "dessen"], 0, "Relative pronoun in nominative masculine is der.", "B1", "grammar", "Relativsätze"),
  q("placement-core", 12, "multiple_choice", "Wegen ___ Wetters bleiben wir zu Hause.", ["der", "dem", "des", "den"], 2, "wegen often takes Genitiv: des Wetters.", "B1", "grammar", "Genitiv"),
  q("placement-core", 13, "multiple_choice", "Das Projekt ___ bis Freitag abgeschlossen werden.", ["muss", "hat", "ist", "wird haben"], 0, "Modal passive: muss abgeschlossen werden.", "B2", "grammar", "Passiv"),
  q("placement-core", 14, "multiple_choice", "Wenn ich mehr Zeit ___, ___ ich öfter lesen.", ["habe/werde", "hätte/würde", "hatte/werde", "hätte/werde"], 1, "Irreal condition uses Konjunktiv II: hätte/würde.", "B2", "grammar", "Konjunktiv II"),
  q("placement-core", 15, "true_false", "'Ich bin der Meinung, dass...' introduces an opinion.", ["True", "False"], true, "der Meinung sein means to be of the opinion.", "B2", "reading", "Argumentation"),

  q("a1-artikel", 1, "multiple_choice", "___ Frau arbeitet heute.", ["Der", "Die", "Das"], 1, "Frau is feminine: die Frau.", "A1", "grammar", "Artikel"),
  q("a1-artikel", 2, "multiple_choice", "___ Kind spielt.", ["Der", "Die", "Das"], 2, "Kind is neuter: das Kind.", "A1", "grammar", "Artikel"),
  q("a1-artikel", 3, "multiple_choice", "___ Tisch ist groß.", ["Der", "Die", "Das"], 0, "Tisch is masculine: der Tisch.", "A1", "grammar", "Artikel"),
  q("a1-artikel", 4, "fill_blank", "Fill the article: ___ Auto", ["der", "die", "das"], "das", "Auto is neuter: das Auto.", "A1", "grammar", "Artikel"),
  q("a1-artikel", 5, "true_false", "'die Buch' is correct.", ["True", "False"], false, "It is das Buch.", "A1", "grammar", "Artikel"),

  q("a2-akkusativ", 1, "multiple_choice", "Ich brauche ___ Termin.", ["der", "den", "dem", "die"], 1, "brauchen takes Akkusativ: den Termin.", "A2", "grammar", "Akkusativ"),
  q("a2-akkusativ", 2, "multiple_choice", "Sie kauft ___ Kaffee.", ["ein", "einen", "einem", "eine"], 1, "Kaffee is masculine; Akkusativ: einen Kaffee.", "A2", "grammar", "Akkusativ"),
  q("a2-akkusativ", 3, "fill_blank", "Ich sehe ___ Mann.", ["den", "dem", "der"], "den", "sehen takes Akkusativ.", "A2", "grammar", "Akkusativ"),
  q("a2-akkusativ", 4, "true_false", "'Ich besuche meinen Freund' is correct.", ["True", "False"], true, "besuchen takes Akkusativ: meinen Freund.", "A2", "grammar", "Akkusativ"),
  q("a2-akkusativ", 5, "multiple_choice", "Das ist für ___.", ["ich", "mich", "mir", "mein"], 1, "für takes Akkusativ: mich.", "A2", "grammar", "Akkusativ"),

  q("a2-dativ", 1, "multiple_choice", "Ich helfe ___ Frau.", ["die", "der", "den", "das"], 1, "helfen takes Dativ: der Frau.", "A2", "grammar", "Dativ"),
  q("a2-dativ", 2, "multiple_choice", "Er spricht mit ___ Arzt.", ["der", "den", "dem", "die"], 2, "mit takes Dativ: dem Arzt.", "A2", "grammar", "Dativ"),
  q("a2-dativ", 3, "fill_blank", "Ich danke ___ Lehrer.", ["dem", "den", "der"], "dem", "danken takes Dativ.", "A2", "grammar", "Dativ"),
  q("a2-dativ", 4, "true_false", "'mit den Kindern' is correct plural Dativ.", ["True", "False"], true, "Plural Dativ often uses den + -n.", "A2", "grammar", "Dativ"),
  q("a2-dativ", 5, "multiple_choice", "Nach ___ Arbeit gehe ich nach Hause.", ["die", "der", "den", "das"], 1, "nach takes Dativ: nach der Arbeit.", "A2", "grammar", "Dativ"),

  q("a2-perfekt", 1, "multiple_choice", "Ich ___ gestern gearbeitet.", ["bin", "habe", "hat", "war"], 1, "arbeiten uses haben in Perfekt.", "A2", "grammar", "Perfekt"),
  q("a2-perfekt", 2, "multiple_choice", "Wir ___ nach München gefahren.", ["haben", "sind", "seid", "waren"], 1, "fahren as movement uses sein.", "A2", "grammar", "Perfekt"),
  q("a2-perfekt", 3, "fill_blank", "Partizip II of machen: ich habe es ___", ["gemacht", "gemachen", "gemachtet"], "gemacht", "machen -> gemacht.", "A2", "grammar", "Perfekt"),
  q("a2-perfekt", 4, "true_false", "'Ich bin geblieben' is correct.", ["True", "False"], true, "bleiben uses sein.", "A2", "grammar", "Perfekt"),
  q("a2-perfekt", 5, "multiple_choice", "Sie ___ einen Film gesehen.", ["ist", "hat", "haben", "seid"], 1, "sehen uses haben.", "A2", "grammar", "Perfekt"),

  q("a2-alltag-vocab", 1, "multiple_choice", "der Termin", ["appointment", "invoice", "rent", "doctor"], 0, "der Termin means appointment.", "A2", "vocabulary", "Alltag vocabulary"),
  q("a2-alltag-vocab", 2, "multiple_choice", "die Rechnung", ["bill/invoice", "trip", "message", "office"], 0, "die Rechnung is bill or invoice.", "A2", "vocabulary", "Alltag vocabulary"),
  q("a2-alltag-vocab", 3, "fill_blank", "Translate 'rent': die ___", ["Miete", "Mitte", "Mittel"], "Miete", "die Miete means rent.", "A2", "vocabulary", "Wohnung vocabulary"),
  q("a2-alltag-vocab", 4, "multiple_choice", "bezahlen", ["to pay", "to order", "to complain", "to move"], 0, "bezahlen means to pay.", "A2", "vocabulary", "Einkauf vocabulary"),
  q("a2-alltag-vocab", 5, "true_false", "'die Krankenkasse' means health insurance provider.", ["True", "False"], true, "Krankenkasse is health insurance provider.", "A2", "vocabulary", "Alltag vocabulary"),

  q("b1-word-order", 1, "sentence_order", "Order the sentence.", ["Ich", "lerne", "Deutsch", "jeden", "Tag"], ["Ich", "lerne", "Deutsch", "jeden", "Tag"], "Verb second in the main clause.", "B1", "grammar", "Wortstellung"),
  q("b1-word-order", 2, "sentence_order", "Order the subordinate clause.", ["weil", "ich", "morgen", "arbeiten", "muss"], ["weil", "ich", "morgen", "arbeiten", "muss"], "Conjugated verb at the end.", "B1", "grammar", "Wortstellung"),
  q("b1-word-order", 3, "multiple_choice", "Morgen ___ ich einen Termin.", ["habe", "ich habe", "haben", "hat"], 0, "With fronted adverb, verb remains second: Morgen habe ich...", "B1", "grammar", "Wortstellung"),
  q("b1-word-order", 4, "true_false", "'Ich weiß, dass er heute kommt' is correct.", ["True", "False"], true, "dass sends the verb to the end.", "B1", "grammar", "Wortstellung"),
  q("b1-word-order", 5, "multiple_choice", "Choose correct sentence.", ["Ich kann heute nicht kommen.", "Ich heute nicht kommen kann.", "Ich kann kommen heute nicht."], 0, "Modal verb second, infinitive at the end.", "B1", "grammar", "Wortstellung"),

  q("b1-reading", 1, "multiple_choice", "Notice: 'Die Praxis bleibt am Freitag geschlossen.' What does it mean?", ["The practice is closed Friday", "The practice opens Friday", "The doctor is late"], 0, "bleibt geschlossen = remains closed.", "B1", "reading", "Reading Alltag"),
  q("b1-reading", 2, "true_false", "'Bitte reichen Sie die Unterlagen bis Montag ein' means documents are needed by Monday.", ["True", "False"], true, "bis Montag means by Monday.", "B1", "reading", "Behörden vocabulary"),
  q("b1-reading", 3, "multiple_choice", "Email: 'Ich bitte um Rückmeldung.' The writer wants...", ["a reply", "money", "a ticket", "a room"], 0, "Rückmeldung means response/feedback.", "B1", "reading", "Formal email"),
  q("b1-reading", 4, "multiple_choice", "'Der Zug fällt aus.'", ["Train is cancelled", "Train is late", "Train is full"], 0, "ausfallen means to be cancelled.", "B1", "reading", "Reise vocabulary"),
  q("b1-reading", 5, "fill_blank", "In notices, 'geschlossen' means ___", ["closed", "open", "late"], "closed", "geschlossen = closed.", "B1", "reading", "Reading Alltag"),

  q("b1-mixed", 1, "multiple_choice", "Ich interessiere mich ___ diese Stelle.", ["für", "über", "an", "mit"], 0, "sich interessieren für + Akkusativ.", "B1", "grammar", "Prepositions"),
  q("b1-mixed", 2, "multiple_choice", "die Bewerbung", ["application", "insurance", "rent", "appointment"], 0, "die Bewerbung = application.", "B1", "vocabulary", "Arbeit vocabulary"),
  q("b1-mixed", 3, "sentence_order", "Order.", ["Obwohl", "ich", "krank", "bin", "arbeite", "ich"], ["Obwohl", "ich", "krank", "bin", "arbeite", "ich"], "Subordinate clause first, then inverted main clause.", "B1", "grammar", "Wortstellung"),
  q("b1-mixed", 4, "multiple_choice", "Das Auto ___ gestern repariert.", ["wurde", "hat", "ist", "war hat"], 0, "Passive Präteritum: wurde repariert.", "B1", "grammar", "Passiv"),
  q("b1-mixed", 5, "true_false", "'wegen dem Wetter' is informal; standard is 'wegen des Wetters'.", ["True", "False"], true, "Standard written German uses Genitiv.", "B1", "grammar", "Genitiv"),

  q("b2-exam-mini", 1, "multiple_choice", "Choose the best connector: ___ die Kosten hoch sind, lohnt sich die Weiterbildung.", ["Trotzdem", "Obwohl", "Deshalb", "Außerdem"], 1, "Obwohl introduces a concession.", "B2", "grammar", "Konnektoren"),
  q("b2-exam-mini", 2, "multiple_choice", "The phrase 'eine Maßnahme ergreifen' means...", ["to take a measure", "to miss an appointment", "to rent a flat"], 0, "eine Maßnahme ergreifen = take a measure.", "B2", "vocabulary", "Exam vocabulary"),
  q("b2-exam-mini", 3, "sentence_order", "Order.", ["Je", "mehr", "man", "übt", "desto", "sicherer", "wird", "man"], ["Je", "mehr", "man", "übt", "desto", "sicherer", "wird", "man"], "Je...desto comparative structure.", "B2", "grammar", "Wortstellung"),
  q("b2-exam-mini", 4, "multiple_choice", "Wenn ich früher informiert worden ___, hätte ich reagiert.", ["wäre", "war", "bin", "hätte"], 0, "Passive perfect Konjunktiv II uses wäre ... worden.", "B2", "grammar", "Konjunktiv II"),
  q("b2-exam-mini", 5, "true_false", "An exam argumentation should include counterarguments.", ["True", "False"], true, "B2 writing/reading expects balanced argumentation.", "B2", "reading", "Argumentation"),
];

export const SEED_TEST_QUESTIONS: QuestionSeed[] = buildQuestions();

function buildQuestions(): QuestionSeed[] {
  const generated: QuestionSeed[] = [...baseQuestions];
  for (const test of SEED_TESTS) {
    const existing = generated.filter((item) => item.testKey === test.key);
    const template = existing.length ? existing : fallbackQuestions(test);
    let order = existing.length + 1;
    while (generated.filter((item) => item.testKey === test.key).length < 10) {
      const source = template[(order - 1) % template.length];
      generated.push({
        ...source,
        order,
        question: `${source.question} (${order})`,
      });
      order += 1;
    }
  }
  return generated;
}

function fallbackQuestions(test: TestSeed): QuestionSeed[] {
  return [
    q(test.key, 1, "multiple_choice", "Choose the correct option: Ich ___ Deutsch.", ["lerne", "lernst", "lernt"], 0, "ich + lernen = lerne.", test.level, test.skill, "Wortstellung"),
  ];
}

function q(
  testKey: string,
  order: number,
  type: TestQuestionType,
  question: string,
  options: string[],
  correctAnswer: TestAnswer,
  explanation: string,
  level: CEFRLevel,
  skill: TestSkill,
  topic: string
): QuestionSeed {
  return { testKey, order, type, question, options, correctAnswer, explanation, level, skill, topic };
}

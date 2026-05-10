import { test as base, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { e2eUser, onboardingUser } from "./test-users";
import { jsonResponse } from "../utils/test-helpers";
import { mockAiRoutes, mockAiWords, mockReadingText } from "../utils/mock-ai";

type E2EFixtures = {
  authenticatedPage: Page;
};

const todayPlanSteps = [
  {
    id: "task-vocab",
    type: "new_words",
    label: "Learn work words",
    estimatedMinutes: 5,
    status: "pending",
    order: 1,
    payload: { words: mockAiWords },
  },
  {
    id: "task-reading",
    type: "reading",
    label: "Read a short text",
    estimatedMinutes: 7,
    status: "pending",
    order: 2,
    payload: { text: mockReadingText },
  },
];

function authCookieHeader() {
  const state = JSON.parse(readFileSync(".auth/e2e-user.json", "utf8")) as { cookies: { name: string; value: string }[] };
  const cookie = state.cookies.find((item) => item.name === "dm_session");
  if (!cookie) throw new Error("Missing dm_session in .auth/e2e-user.json");
  return `dm_session=${cookie.value}; Path=/; HttpOnly; SameSite=Lax`;
}

function publicUser(user = e2eUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nativeLanguage: user.nativeLanguage,
    currentGermanLevel: user.currentGermanLevel,
    targetGermanLevel: user.targetGermanLevel,
    learningGoals: user.learningGoals,
    profession: user.profession,
    studyPurpose: user.studyPurpose,
    dailyStudyMinutes: user.dailyStudyMinutes,
    studyDaysPerWeek: user.studyDaysPerWeek,
    preferredFormats: user.preferredFormats,
    preferredTopics: user.preferredTopics,
    weakSkills: user.weakSkills,
    weakGrammarAreas: user.weakGrammarAreas,
    onboardingCompleted: user.onboardingCompleted,
    placementTestCompleted: user.placementTestCompleted,
    streakCount: user.streakCount,
    streakLastDate: user.streakLastDate,
    totalStudyDays: user.totalStudyDays,
    interfaceTheme: user.interfaceTheme,
  };
}

async function mockApiRoutes(page: Page) {
  await mockAiRoutes(page);

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill(jsonResponse({ user: publicUser() }));
  });
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill(jsonResponse({ user: publicUser() }, 200, { "set-cookie": authCookieHeader() }));
  });
  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill(jsonResponse({ user: publicUser(onboardingUser) }, 201, { "set-cookie": authCookieHeader() }));
  });
  await page.route("**/api/auth/logout", async (route) => {
    await route.fulfill(jsonResponse({ ok: true }, 200, { "set-cookie": "dm_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" }));
  });

  await page.route("**/api/onboarding/questions", async (route) => {
    await route.fulfill(
      jsonResponse({
        questions: [
          {
            id: "onboarding-1",
            order: 1,
            key: "learningGoals",
            question_ru: "Why are you learning German?",
            type: "multi_select",
            options: [{ value: "work", label_ru: "Work", emoji: "💼" }],
          },
          { id: "onboarding-2", order: 2, key: "dailyStudyMinutes", question_ru: "Minutes per day", type: "slider", min: 10, max: 60, step: 5 },
        ],
      })
    );
  });
  await page.route("**/api/onboarding/submit", async (route) => route.fulfill(jsonResponse({ ok: true })));
  await page.route("**/api/placement-test", async (route) => {
    await route.fulfill(
      jsonResponse({
        questions: [
          { id: "placement-1", order: 1, question_de: "Ich ___ Deutsch.", question_ru: "Choose the verb", options: ["lerne", "lernen"], cefr_level: "A1", area: "verbs" },
          { id: "placement-2", order: 2, question_de: "Das ist ___ Auto.", question_ru: "Choose article", options: ["ein", "eine"], cefr_level: "A1", area: "articles" },
        ],
      })
    );
  });
  await page.route("**/api/placement-test/submit", async (route) => {
    await route.fulfill(jsonResponse({ score: 80, detectedLevel: "A2", weakAreas: ["articles"] }));
  });

  await page.route("**/api/dashboard", async (route) => {
    await route.fulfill(
      jsonResponse({
        user: { id: e2eUser.id, name: e2eUser.name, current_level: "A2", target_level: "B1", minutes_per_day: 30, streak_days: 4, profession: "Software engineer" },
        progress: [{ label: "Vocabulary", current: 18, target: 100, unit: "words", progress_percent: 18, href: "/vocabulary", empty: false }],
        today_plan: {
          id: "plan-1",
          date: "2026-05-09",
          status: "pending",
          estimated_minutes: 12,
          completed: 0,
          total: 2,
          progress_percent: 0,
          steps: todayPlanSteps.map((step) => ({ type: step.type, title: step.label, estimate_minutes: step.estimatedMinutes, status: "pending", href: "/daily-plan" })),
        },
        stats: { words_learned: 18, due_reviews: 3, grammar_completed: 2, reading_completed: 1, writing_submissions: 1, last_writing_score: 86, last_test_score: 80, accuracy_percent: 82, level_progress_percent: 35 },
        weak_areas: [{ type: "grammar", slug: "akkusativ", title: "Akkusativ", confidence: 54, source: "test", href: "/grammar/akkusativ" }],
        recommendation: { title: "Review Akkusativ", text: "Practice article endings with short examples.", cta: "Start practice", target: { type: "focused_practice", topic: "akkusativ", practiceType: "grammar" } },
        last_activity: [{ type: "reading", title: "Ein Termin beim Arzt", occurred_at: "2026-05-09T10:00:00.000Z", href: "/reading/reading-1" }],
      })
    );
  });

  let started = false;
  let completed = 0;
  const planBody = () => ({
    plan: {
      id: "plan-1",
      status: completed >= todayPlanSteps.length ? "completed" : started ? "in_progress" : "pending",
      steps: todayPlanSteps.map((step, index) => ({ ...step, status: index < completed ? "completed" : "pending" })),
      estimated_minutes: 12,
      steps_completed: completed,
      steps_total: todayPlanSteps.length,
      progress_percent: Math.round((completed / todayPlanSteps.length) * 100),
      active_task_id: todayPlanSteps[completed]?.id ?? null,
    },
  });
  await page.route("**/api/daily-plan/today", async (route) => route.fulfill(jsonResponse(planBody())));
  await page.route("**/api/daily-plan/start", async (route) => {
    started = true;
    await route.fulfill(jsonResponse(planBody()));
  });
  await page.route("**/api/daily-plan/tasks/*/complete", async (route) => {
    completed = Math.min(completed + 1, todayPlanSteps.length);
    await route.fulfill(jsonResponse(planBody()));
  });
  await page.route("**/api/daily-plan/result", async (route) => {
    await route.fulfill(jsonResponse({ result: { completed: true, tasks_completed: 2, total_tasks: 2, accuracy: 90, words_learned: 2, weak_areas: ["articles"], time_spent: 12, streak: 5 } }));
  });

  let vocabulary: Record<string, unknown>[] = [
    { ...mockAiWords[0], id: "word-1", is_system: true },
    { id: "word-2", german: "der Termin", translation_ru: "встреча", article: "der", word_type: "noun", cefr_level: "A2", topic: "Arzt", example_de: "Ich habe einen Termin.", is_system: true },
  ];
  await page.route("**/api/vocabulary?**", async (route) => route.fulfill(jsonResponse({ words: vocabulary })));
  await page.route("**/api/vocabulary", async (route) => {
    if (route.request().method() === "POST") {
      let body: Record<string, unknown> = {};
      try {
        body = route.request().postDataJSON() as Record<string, unknown>;
      } catch {
        body = {};
      }
      const created = { id: `word-${Date.now()}`, is_system: false, ...body };
      vocabulary = [created, ...vocabulary];
      await route.fulfill(jsonResponse({ word: created }, 201));
      return;
    }
    await route.fallback();
  });
  await page.route("**/api/vocabulary/*", async (route) => {
    if (route.request().method() === "DELETE") {
      vocabulary = vocabulary.slice(1);
      await route.fulfill(jsonResponse({ deleted: "word" }));
      return;
    }
    await route.fulfill(jsonResponse({ word: vocabulary[0] }));
  });
  await page.route("**/api/vocabulary/*/review", async (route) => route.fulfill(jsonResponse({ ok: true })));
  await page.route("**/api/vocabulary/review", async (route) => route.fulfill(jsonResponse({ words: vocabulary })));

  await page.route("**/api/reading/texts", async (route) => route.fulfill(jsonResponse({ texts: [mockReadingText], topics: ["Arzt"], profile: { currentLevel: "A2", targetLevel: "B1", profession: "Software engineer", weakAreas: ["articles"], preferredTopics: ["Arzt"] } })));
  await page.route("**/api/reading/texts/reading-1", async (route) => route.fulfill(jsonResponse({ text: mockReadingText })));
  await page.route("**/api/reading/texts/reading-1/progress", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill(jsonResponse({ progress: { score: 100, answers: { 0: 0 } }, checked: [{ questionIndex: 0, selected: 0, correct: true, answer: 0 }] }));
      return;
    }
    await route.fulfill(jsonResponse({ progress: null }));
  });

  const writingTask = {
    id: "writing-1",
    title: "Formal appointment email",
    level: "B1",
    topic: "Arbeit",
    type: "formal_email",
    instructions: "Write a formal email to request an appointment.",
    requirements: ["Greeting", "Reason", "Preferred time"],
    hints: ["Use Konjunktiv II for politeness"],
    usefulPhrases: ["Sehr geehrte Damen und Herren,", "Mit freundlichen Gruessen"],
    minWords: 25,
    estimatedMinutes: 15,
    idealAnswer: "Sehr geehrte Damen und Herren, ich moechte gerne einen Termin vereinbaren.",
    status: "new",
    lastScore: null,
  };
  await page.route("**/api/writing/tasks", async (route) => route.fulfill(jsonResponse({ tasks: [writingTask] })));
  await page.route("**/api/writing/tasks/writing-1", async (route) => route.fulfill(jsonResponse({ task: writingTask })));
  await page.route("**/api/writing/tasks/writing-1/draft", async (route) => {
    await route.fulfill(jsonResponse(route.request().method() === "PATCH" ? { ok: true } : { draft: { text: "" } }));
  });
  await page.route("**/api/writing/tasks/writing-1/submissions", async (route) => route.fulfill(jsonResponse({ submissions: [] })));

  const testCard = { id: "test-1", title: "A2 mixed checkpoint", level: "A2", skill: "mixed", type: "practice", timeLimit: null, questionsCount: 2, description: "Short deterministic e2e test.", bestScore: null, status: "new" };
  const questions = [
    { id: "q1", order: 1, type: "multiple_choice", question: "Choose the correct article: ___ Termin", options: ["der", "die"], level: "A2", skill: "grammar", topic: "articles" },
    { id: "q2", order: 2, type: "true_false", question: "Ich lerne Deutsch means I learn German.", options: [], level: "A1", skill: "reading", topic: "basics" },
  ];
  let attempt: {
    id: string;
    answers: Record<string, unknown>;
    score: number | null;
    correct: number | null;
    total: number;
    estimatedLevel: string | null;
    weakAreas: string[];
    strongAreas: string[];
    status: "in_progress" | "completed";
    startedAt: string;
    completedAt: string | null;
    timeSpent: number | null;
  } = { id: "attempt-1", answers: {}, score: null, correct: null, total: 2, estimatedLevel: null, weakAreas: [], strongAreas: [], status: "in_progress", startedAt: "2026-05-09T10:00:00.000Z", completedAt: null, timeSpent: null };
  await page.route("**/api/tests", async (route) => route.fulfill(jsonResponse({ tests: [testCard] })));
  await page.route("**/api/tests/test-1", async (route) => route.fulfill(jsonResponse({ test: testCard, questions })));
  await page.route("**/api/tests/test-1/start", async (route) => {
    attempt = { ...attempt, answers: {}, status: "in_progress", score: null, correct: null };
    await route.fulfill(jsonResponse({ attempt }));
  });
  await page.route("**/api/tests/test-1/answer", async (route) => {
    const body = await route.request().postDataJSON();
    attempt = { ...attempt, answers: { ...attempt.answers, [body.questionId]: body.answer } };
    await route.fulfill(jsonResponse({ ok: true }));
  });
  await page.route("**/api/tests/test-1/complete", async (route) => {
    attempt = { ...attempt, status: "completed", score: 100, correct: 2, estimatedLevel: "A2", weakAreas: [], strongAreas: ["articles", "basics"], completedAt: "2026-05-09T10:03:00.000Z", timeSpent: 180 };
    await route.fulfill(jsonResponse({ attempt }));
  });
}

export const test = base.extend<E2EFixtures>({
  page: async ({ page }, run) => {
    await mockApiRoutes(page);
    await run(page);
  },
  authenticatedPage: async ({ page }, run) => {
    await mockApiRoutes(page);
    await run(page);
  },
});

export { expect };

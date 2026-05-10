export const E2E_USER_ID = "660000000000000000000001";
export const E2E_USER_EMAIL = "e2e.student@example.com";
export const E2E_USER_PASSWORD = "E2ePassword123!";

export const e2eUser = {
  id: E2E_USER_ID,
  email: E2E_USER_EMAIL,
  password: E2E_USER_PASSWORD,
  name: "E2E Student",
  nativeLanguage: "ru",
  currentGermanLevel: "A2" as const,
  targetGermanLevel: "B1" as const,
  learningGoals: ["work", "daily_life"],
  profession: "Software engineer",
  studyPurpose: "Work in Germany",
  dailyStudyMinutes: 30,
  studyDaysPerWeek: 5,
  preferredFormats: ["vocabulary", "reading", "writing"],
  preferredTopics: ["Alltag", "Arbeit"],
  weakSkills: ["grammar"],
  weakGrammarAreas: ["akkusativ"],
  onboardingCompleted: true,
  placementTestCompleted: true,
  streakCount: 4,
  streakLastDate: "2026-05-09",
  totalStudyDays: 12,
  interfaceTheme: "system" as const,
};

export const onboardingUser = {
  ...e2eUser,
  id: "660000000000000000000002",
  email: "e2e.onboarding@example.com",
  name: "E2E Onboarding",
  onboardingCompleted: false,
  placementTestCompleted: false,
};

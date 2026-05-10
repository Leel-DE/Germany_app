import { test } from "../fixtures/auth.fixture";
import { DashboardPage } from "../pages/DashboardPage";
import { expectPath } from "../utils/test-helpers";

test.describe("dashboard critical flows", () => {
  test("loads dashboard with today's plan and recommendation", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLoaded();
  });

  test("opens daily plan from dashboard", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.openDailyPlan();
    await expectPath(page, /^\/daily-plan/);
  });
});

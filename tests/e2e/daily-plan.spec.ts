import { test, expect } from "../fixtures/auth.fixture";
import { DailyPlanPage } from "../pages/DailyPlanPage";

test.describe("daily plan critical flows", () => {
  test("starts plan, completes tasks, finishes day", async ({ page }) => {
    const dailyPlan = new DailyPlanPage(page);
    await dailyPlan.goto();
    await dailyPlan.start();
    await expect(page.getByText(/task 1 of 2/i)).toBeVisible();

    await dailyPlan.completeCurrentTask();
    await expect(page.getByText(/task 2 of 2/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/task 2 of 2/i)).toBeVisible();

    await dailyPlan.completeCurrentTask();
    await dailyPlan.expectFinished();
  });
});

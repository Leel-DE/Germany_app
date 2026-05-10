import { test, expect } from "../fixtures/auth.fixture";
import { expectPath } from "../utils/test-helpers";

test.describe("onboarding critical flows", () => {
  test("completes onboarding quiz, placement test, and opens dashboard", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: /work/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.locator('input[type="range"]').fill("30");
    await page.getByRole("button", { name: /save profile/i }).click();

    await expectPath(page, /^\/onboarding\/placement-test/);
    await page.getByRole("button", { name: /^lerne$/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("button", { name: /^ein$/i }).click();
    await page.getByRole("button", { name: /finish test/i }).click();

    await expect(page.getByRole("heading", { name: /starting level is a2/i })).toBeVisible();
    await page.getByRole("button", { name: /open dashboard/i }).click();
    await expectPath(page, /^\/home/);
  });
});

import { test, expect } from "../fixtures/auth.fixture";
import { VocabularyPage } from "../pages/VocabularyPage";

test.describe("vocabulary critical flows", () => {
  test("adds and deletes a word", async ({ page }) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.goto();
    await vocabulary.addWord();
    await vocabulary.expectWord(/versicherung/i);
    await vocabulary.deleteFirstWord();
    await expect(page.getByText(/deleted|removed|удален/i).first()).toBeVisible();
  });

  test("reviews cards through the daily plan vocabulary task", async ({ page }) => {
    await page.goto("/daily-plan");
    await page.getByRole("button", { name: /start today's plan/i }).click();
    await expect(page.getByText(/die bewerbung/i)).toBeVisible();
    await page.getByRole("button", { name: /next word/i }).click();
    await page.getByRole("button", { name: /mark words learned/i }).click();
    await expect(page.getByText(/task 2 of 2/i)).toBeVisible();
  });

  test("generates AI words with deterministic mock", async ({ page }) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.goto();
    await vocabulary.generateWords();
    await vocabulary.expectWord(/bewerbung/i);
    await expect(page.getByText(/2/).first()).toBeVisible();
  });
});

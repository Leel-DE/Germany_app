import { expect, type Page } from "@playwright/test";

export class DailyPlanPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/daily-plan");
  }

  async start() {
    await this.page.getByRole("button", { name: /start today's plan/i }).click();
  }

  async completeCurrentTask() {
    const nextWord = this.page.getByRole("button", { name: /next word/i });
    if (await nextWord.isVisible().catch(() => false)) {
      await nextWord.click();
    }
    const readConfirm = this.page.getByRole("button", { name: /i have read/i });
    if (await readConfirm.isVisible().catch(() => false)) {
      await readConfirm.click();
      await this.page.getByRole("button", { name: /zum arzt/i }).click();
    }
    await this.page.getByRole("button", { name: /complete task|mark words learned|save progress/i }).click();
  }

  async expectFinished() {
    await expect(this.page.getByRole("heading", { name: /day completed/i })).toBeVisible();
  }
}

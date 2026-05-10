import { expect, type Page } from "@playwright/test";

export class TestsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/tests");
  }

  async startFirstTest() {
    await this.page.getByRole("link", { name: /a2 mixed checkpoint/i }).click();
  }

  async answerAndFinish() {
    await this.page.getByRole("button", { name: /^der$/i }).click();
    await this.page.getByRole("button", { name: /^next$/i }).click();
    await this.page.getByRole("button", { name: /^true$/i }).click();
    await this.page.getByRole("button", { name: /finish/i }).click();
  }

  async expectResult() {
    await expect(this.page.getByText(/100/).first()).toBeVisible();
    await expect(this.page.getByRole("link", { name: /review mistakes/i })).toBeVisible();
  }
}

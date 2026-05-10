import { expect, type Page } from "@playwright/test";

export class ReadingPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/reading");
  }

  async openFirstText() {
    await this.page.getByRole("link", { name: /ein termin beim arzt/i }).click();
  }

  async addSelectedWordToVocabulary() {
    await this.page.getByRole("button", { name: "Termin", exact: true }).first().click();
    await this.page.getByLabel(/russian translation/i).fill("встреча");
    await this.page.getByRole("button", { name: /add to vocabulary/i }).click();
    await expect(this.page.getByText(/added to vocabulary/i)).toBeVisible();
  }

  async completeQuiz() {
    await this.page.getByRole("button", { name: /zum arzt/i }).click();
    await this.page.getByRole("button", { name: /save progress/i }).click();
    await expect(this.page.getByText(/100%/i)).toBeVisible();
  }
}

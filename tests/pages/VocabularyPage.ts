import { expect, type Page } from "@playwright/test";

export class VocabularyPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/vocabulary");
  }

  async addWord() {
    await this.page.getByRole("link", { name: /add|добав/i }).click();
    await this.page.getByRole("textbox", { name: /^german$/i }).fill("Versicherung");
    await this.page.getByRole("button", { name: /die/i }).click();
    await this.page.getByRole("textbox", { name: /^translation$/i }).fill("страховка");
    await this.page.getByRole("button", { name: /save|сохран/i }).click();
  }

  async generateWords() {
    await this.page.getByRole("button", { name: /generate|ai/i }).click();
  }

  async deleteFirstWord() {
    await this.page.getByLabel(/delete/i).first().click();
    await this.page.getByRole("button", { name: /^delete$|удал/i }).click();
  }

  async expectWord(text: string | RegExp) {
    await expect(this.page.getByText(text).first()).toBeVisible();
  }
}

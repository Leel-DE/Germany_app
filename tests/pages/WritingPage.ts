import { expect, type Page } from "@playwright/test";

export class WritingPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/writing");
  }

  async openTask() {
    await this.page.getByRole("link", { name: /formal appointment email/i }).click();
  }

  async saveDraft(text: string) {
    await this.page.getByPlaceholder(/sehr geehrte/i).fill(text);
    await this.page.getByRole("button", { name: /save draft/i }).click();
    await expect(this.page.getByText("Draft saved.")).toBeVisible();
  }

  async submit() {
    await this.page.getByRole("button", { name: /submit for ai check/i }).click();
    await expect(this.page.getByText(/ai feedback/i)).toBeVisible();
    await expect(this.page.getByText("86").first()).toBeVisible();
  }
}

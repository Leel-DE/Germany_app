import { expect, type Page } from "@playwright/test";

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/home");
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: /e2e student/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /today's plan/i })).toBeVisible();
    await expect(this.page.getByText(/review akkusativ/i)).toBeVisible();
  }

  async openDailyPlan() {
    await this.page.getByRole("link", { name: /start.*plan/i }).click();
  }
}

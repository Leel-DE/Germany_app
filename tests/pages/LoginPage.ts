import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
    await this.page.getByRole("button", { name: /sign in|войти/i }).waitFor();
  }

  async login(email: string, password: string) {
    const form = this.page.locator("form");
    const emailInput = form.locator('input[type="email"]');
    await fillStable(emailInput, email);
    await emailInput.evaluate((node) => (node as HTMLInputElement).blur());
    await fillStable(form.locator('input[type="password"]'), password);
    await fillStable(emailInput, email);
    await this.page.locator("form").evaluate((form) => (form as HTMLFormElement).requestSubmit());
  }

  async register(name: string, email: string, password: string) {
    await this.page.goto("/register");
    await this.page.getByRole("button", { name: /create account|sign up|зарегистр/i }).waitFor();
    const form = this.page.locator("form");
    await fillStable(form.locator('input[autocomplete="name"]'), name);
    await fillStable(form.locator('input[type="email"]'), email);
    await fillStable(form.locator('input[type="password"]'), password);
    await form.getByRole("button").click();
  }
}

async function fillStable(locator: ReturnType<Page["locator"]>, value: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await locator.fill("");
    await locator.pressSequentially(value);
    try {
      await expect(locator).toHaveValue(value, { timeout: 1_000 });
      return;
    } catch {
      if (attempt === 2) throw new Error(`Could not fill input with stable value: ${value}`);
    }
  }
}

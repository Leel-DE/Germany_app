import { expect, type Locator, type Page } from "@playwright/test";

export async function clickFirstVisible(locators: Locator[]) {
  for (const locator of locators) {
    if (await locator.first().isVisible().catch(() => false)) {
      await locator.first().click();
      return;
    }
  }
  throw new Error("No visible locator matched.");
}

export async function fillByLabelOrPlaceholder(page: Page, label: RegExp, placeholder: RegExp, value: string) {
  const byLabel = page.getByLabel(label).first();
  if (await byLabel.isVisible().catch(() => false)) {
    await byLabel.fill(value);
    return;
  }
  await page.getByPlaceholder(placeholder).first().fill(value);
}

export async function expectPath(page: Page, pattern: RegExp) {
  await expect.poll(() => new URL(page.url()).pathname).toMatch(pattern);
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return {
    status,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export async function answerVisibleOptions(page: Page, count: number) {
  for (let i = 0; i < count; i += 1) {
    const buttons = page.locator("button").filter({ hasText: /.+/ });
    const option = buttons.nth(i);
    await option.click();
  }
}

import { test, expect } from "../fixtures/auth.fixture";
import { LoginPage } from "../pages/LoginPage";
import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from "../fixtures/test-users";
import { expectPath } from "../utils/test-helpers";

test.describe("auth critical flows", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("register redirects new users to onboarding", async ({ page }) => {
    const login = new LoginPage(page);
    await login.register("New Student", "new.student@example.com", E2E_USER_PASSWORD);
    await expectPath(page, /^\/onboarding/);
  });

  test("login creates a session and redirects to dashboard", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(E2E_USER_EMAIL, E2E_USER_PASSWORD);
    await expectPath(page, /^\/home/);
  });

  test("protected routes redirect anonymous users", async ({ page }) => {
    await page.unroute("**/api/auth/me").catch(() => {});
    await page.goto("/home");
    await expectPath(page, /^\/login/);
    await expect(page).toHaveURL(/next=%2Fhome/);
  });
});

test.describe("authenticated session", () => {
  test("persists across reloads", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByRole("heading", { name: /e2e student/i })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: /e2e student/i })).toBeVisible();
  });

  test("logout clears client session", async ({ page }) => {
    await page.goto("/home");
    await page.evaluate(() => fetch("/api/auth/logout", { method: "POST" }));
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in|войти/i })).toBeVisible();
  });
});

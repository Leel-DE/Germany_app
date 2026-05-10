# E2E Testing

DeutschMaster uses Playwright as the main end-to-end testing system. The suite covers critical user flows across auth, onboarding, dashboard, daily plan, vocabulary, reading, writing, and tests.

## Strategy

E2E tests validate that routed screens, protected layouts, client interactions, API contracts, and critical redirects work together. They do not replace unit tests for pure functions, isolated component edge cases, or database model details.

AI requests are never sent to real providers in e2e. `tests/utils/mock-ai.ts` returns deterministic responses, and `tests/fixtures/auth.fixture.ts` intercepts AI endpoints before pages navigate.

## Commands

- `npm run test:e2e` runs all e2e tests.
- `npm run test:e2e:ui` opens Playwright UI mode.
- `npm run test:e2e:debug` runs with Playwright Inspector.
- `npm run test:e2e:headed` runs browsers headed.
- `npm run test:e2e:report` opens the latest HTML report.

## Setup

Playwright is configured in `playwright.config.ts` with Chromium, Firefox, WebKit, HTML report, traces on retry, screenshots on failure, and videos retained on failure.

Required local environment:

```bash
MONGODB_URI=...
MONGODB_DB=deutschmaster
AUTH_SECRET=development-only-secret-change-me-12345678
```

The app uses a server dashboard layout that reads the user from MongoDB. Global setup seeds stable e2e users and writes `.auth/e2e-user.json` for reusable `storageState`.

## Folder Structure

```text
tests/
  e2e/
  pages/
  fixtures/
  utils/
docs/testing/
playwright.config.ts
.github/workflows/e2e.yml
```

## Debugging

Use `npm run test:e2e:debug` for Inspector and `npm run test:e2e:headed` for visible browsers. Failed runs keep screenshots, videos, and traces in `test-results/`. The HTML report is written to `playwright-report/`.

To inspect a trace:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## CI/CD

The GitHub Actions workflow installs dependencies, caches Playwright browsers, installs browser dependencies, typechecks, runs e2e tests, and uploads reports/artifacts. CI needs `MONGODB_URI`, `MONGODB_DB`, and `AUTH_SECRET` secrets.

## Flaky Test Prevention

Tests use role/text locators, Page Objects, route interception, deterministic data, `expect` polling, and storageState reuse. Avoid hardcoded sleeps, brittle CSS selectors, random test data, and real AI/network provider calls.

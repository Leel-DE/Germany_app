# Playwright Setup

## Installation

Playwright is installed as a dev dependency:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

## Configuration

`playwright.config.ts` configures:

- `baseURL` from `PLAYWRIGHT_BASE_URL` or `http://localhost:3000`.
- `webServer` running `next dev`.
- Chromium, Firefox, and WebKit projects.
- HTML report.
- screenshots on failure.
- videos retained on failure.
- traces on first retry.
- CI retries and worker limits.

## Browsers

Run all browsers:

```bash
npm run test:e2e
```

Run one browser:

```bash
npx playwright test --project=chromium
```

## Auth Reuse

Global setup seeds stable MongoDB users and writes `.auth/e2e-user.json`. Tests reuse that `storageState`, so authenticated flows do not log in repeatedly.

## Storage State

The stored state contains the `dm_session` cookie signed with `AUTH_SECRET`. Keep `.auth/` ignored by Git.

## Environment

Local:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000
MONGODB_URI=...
MONGODB_DB=deutschmaster
AUTH_SECRET=development-only-secret-change-me-12345678
AI_MOCK_MODE=1
```

Dev and CI both run with mocked AI. Production smoke tests can point `PLAYWRIGHT_BASE_URL` to a deployed URL, but they still need a safe test database and must keep AI mocked.

## Debug Mode

```bash
npm run test:e2e:debug
```

## Headed Mode

```bash
npm run test:e2e:headed
```

## Trace Viewer

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Screenshots And Videos

Screenshots and videos are saved under `test-results/` on failure. The HTML report links directly to artifacts.

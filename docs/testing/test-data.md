# Test Data Strategy

## Seed Users

`tests/fixtures/global-setup.ts` creates stable users in MongoDB:

- `e2e.student@example.com` for authenticated app flows.
- `e2e.onboarding@example.com` for onboarding-gated behavior.

The password is defined in `tests/fixtures/test-users.ts`.

## Reset Strategy

Global setup upserts users before every Playwright run. Feature data is usually mocked through route interception, so the suite does not depend on previous test records.

## Deterministic Data

Tests use fixed IDs, dates, scores, reading texts, writing feedback, vocabulary words, and dashboard recommendations. This keeps assertions stable across local runs and CI.

## Fixtures

- `auth.fixture.ts` installs authenticated page fixtures and API route mocks.
- `test-users.ts` owns reusable user identity.
- `mock-ai.ts` owns deterministic AI responses.

## AI Mocking

Real AI requests are forbidden in e2e. AI endpoints are intercepted before navigation and return stable payloads matching production shape.

## Isolation

Each test gets a fresh Playwright page. API mocks keep mutable state inside the page fixture, so daily plan progress, attempts, and vocabulary changes do not leak between tests.

## Cleanup

Generated `.auth/`, `test-results/`, and `playwright-report/` are ignored. If CI uses a shared MongoDB, schedule periodic cleanup for documents with `e2e.` emails or use a dedicated `MONGODB_DB` for e2e.

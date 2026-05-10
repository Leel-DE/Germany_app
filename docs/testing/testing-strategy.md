# Testing Strategy

## Tested Through E2E

- P0 auth: register, login, logout, protected routes, session persistence.
- P0 onboarding: profile quiz, placement test, dashboard redirect.
- P0 dashboard and daily plan: load, start, complete, restore after reload, finish day.
- P1 learning modules: vocabulary, reading, writing, tests.
- AI-facing flows through deterministic mocks.

## Not Tested Through E2E

- Pure utilities, validators, and formatting helpers.
- Exhaustive visual states for every component.
- Database index behavior and low-level repository logic.
- Real AI provider behavior, latency, or model quality.
- Browser-specific styling beyond smoke coverage in Chromium, Firefox, and WebKit.

## Smoke Tests

Smoke coverage verifies that protected layouts render, navigation works, and core APIs return expected shapes under mocked data.

## Regression Tests

Regression coverage focuses on previously fragile flows: auth redirects, onboarding gates, daily plan state restoration, AI generation, writing feedback, and test completion.

## Priorities

- P0: flows that block learning entirely.
- P1: core learning modules used repeatedly.
- P2: personalization, analytics, and advanced AI experiences.

## Flaky Prevention

Use deterministic fixtures, route interception, reusable auth state, role-based locators, and Playwright `expect` waits. Do not use random waits, real AI calls, generated emails without cleanup, or CSS selectors tied to layout styling.

## AI Mocking Strategy

All AI endpoints are intercepted in `tests/utils/mock-ai.ts`. The mock responses are stable and shaped like production responses, so UI behavior is covered without provider cost, latency, or nondeterminism.

## Test Data Strategy

Global setup seeds fixed MongoDB users and writes `storageState`. Feature data is intercepted per test page, so tests are isolated from seed drift while still exercising Next.js protected server layouts.

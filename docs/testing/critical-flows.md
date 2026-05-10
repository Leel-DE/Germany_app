# Critical Flows

## P0

- Register: user opens `/register`, submits valid data, receives a session, and lands on onboarding.
- Login: user opens `/login`, submits credentials, receives a session, and lands on `/home`.
- Onboarding: user answers profile questions, completes placement test, sees detected level, and opens dashboard.
- Daily plan: user opens today's plan, starts it, completes ordered tasks, reloads mid-flow, and finishes the day.

## P1

- Vocabulary review: user sees cards and advances through review or learning tasks.
- Vocabulary management: user adds a word, deletes a word, and generates AI words through mocks.
- Reading flow: user opens a text, selects a word, adds it to vocabulary, answers quiz questions, and saves progress.
- Writing submit: user opens a task, saves a draft, submits text, and sees deterministic AI feedback.
- Tests flow: user starts a test, answers questions, completes it, and sees result/next actions.

## P2

- AI generation: vocabulary and reading AI endpoints return stable mocked content.
- Personalization: dashboard recommendations and weak areas render from fixture data.
- Advanced analytics: high-level stats render on dashboard; deeper analytics should get separate regression coverage when the analytics UI stabilizes.

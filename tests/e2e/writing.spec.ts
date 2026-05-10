import { test } from "../fixtures/auth.fixture";
import { WritingPage } from "../pages/WritingPage";

test.describe("writing critical flows", () => {
  test("opens task, saves draft, submits writing, and shows feedback", async ({ page }) => {
    const writing = new WritingPage(page);
    await writing.goto();
    await writing.openTask();
    await writing.saveDraft("Sehr geehrte Damen und Herren, ich moechte einen Termin vereinbaren. Ich kann am Montag kommen und freue mich auf Ihre Antwort.");
    await writing.submit();
  });
});

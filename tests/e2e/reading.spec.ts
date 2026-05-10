import { test } from "../fixtures/auth.fixture";
import { ReadingPage } from "../pages/ReadingPage";

test.describe("reading critical flows", () => {
  test("opens text, adds a word to vocabulary, and completes quiz", async ({ page }) => {
    const reading = new ReadingPage(page);
    await reading.goto();
    await reading.openFirstText();
    await reading.addSelectedWordToVocabulary();
    await reading.completeQuiz();
  });
});

import { test } from "../fixtures/auth.fixture";
import { TestsPage } from "../pages/TestsPage";

test.describe("tests module critical flows", () => {
  test("starts test, answers questions, completes test, and sees result", async ({ page }) => {
    const tests = new TestsPage(page);
    await tests.goto();
    await tests.startFirstTest();
    await tests.answerAndFinish();
    await tests.expectResult();
  });
});

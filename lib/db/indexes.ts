import type { Db } from "mongodb";

/**
 * Create all collection indexes. Idempotent — safe to call on every cold boot.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  await dropIndexIfExists(db, "vocabulary_items", "uniq_german");
  await dropIndexIfConflicting(db, "vocabulary_items", "uniq_system_german", {
    key: { german: 1, isSystem: 1 },
    partialFilterExpression: { isSystem: true },
  });
  await dropIndexIfConflicting(db, "vocabulary_items", "uniq_user_german", {
    key: { createdBy: 1, german: 1 },
    partialFilterExpression: { isSystem: false },
  });
  await dropIndexIfConflicting(db, "writing_tasks", "topic_level", {
    key: { topic: 1, level: 1, type: 1 },
  });
  await dropIndexIfConflicting(db, "user_writing_submissions", "user_recent", {
    key: { userId: 1, createdAt: -1 },
  });

  await Promise.all([
    db.collection("users").createIndexes([
      { key: { email: 1 }, unique: true, name: "uniq_email" },
    ]),
    db.collection("vocabulary_items").createIndexes([
      {
        key: { german: 1, isSystem: 1 },
        unique: true,
        partialFilterExpression: { isSystem: true },
        name: "uniq_system_german",
      },
      {
        key: { createdBy: 1, german: 1 },
        unique: true,
        partialFilterExpression: { isSystem: false },
        name: "uniq_user_german",
      },
      { key: { cefr_level: 1, topic: 1 }, name: "level_topic" },
      { key: { word_type: 1 }, name: "type" },
      { key: { frequency_rank: 1 }, name: "frequency" },
    ]),
    db.collection("user_vocabulary_progress").createIndexes([
      {
        key: { userId: 1, wordId: 1 },
        unique: true,
        name: "uniq_user_word",
      },
      { key: { userId: 1, dueDate: 1, status: 1 }, name: "user_due" },
    ]),
    db.collection("srs_reviews").createIndexes([
      { key: { userId: 1, reviewedAt: -1 }, name: "user_recent" },
      { key: { userId: 1, wordId: 1 }, name: "user_word" },
    ]),
    db.collection("grammar_topics").createIndexes([
      { key: { slug: 1 }, unique: true, name: "uniq_slug" },
      { key: { cefr_level: 1, order_index: 1 }, name: "level_order" },
    ]),
    db.collection("user_grammar_progress").createIndexes([
      {
        key: { userId: 1, topicId: 1 },
        unique: true,
        name: "uniq_user_topic",
      },
    ]),
    db.collection("reading_texts").createIndexes([
      { key: { cefr_level: 1, topic: 1 }, name: "level_topic" },
      { key: { isSystem: 1, createdBy: 1, createdAt: -1 }, name: "visibility_created" },
      { key: { title: "text", content: "text", topic: "text" }, name: "reading_search" },
    ]),
    db.collection("user_reading_progress").createIndexes([
      {
        key: { userId: 1, textId: 1 },
        unique: true,
        name: "uniq_user_text",
      },
      { key: { userId: 1, updatedAt: -1 }, name: "user_recent" },
    ]),
    db.collection("daily_plans").createIndexes([
      { key: { userId: 1, planDate: 1 }, unique: true, name: "uniq_user_day" },
    ]),
    db.collection("placement_questions").createIndexes([
      { key: { order: 1 }, name: "order" },
    ]),
    db.collection("user_test_results").createIndexes([
      { key: { userId: 1, takenAt: -1 }, name: "user_recent" },
    ]),
    db.collection("tests").createIndexes([
      { key: { level: 1, skill: 1, type: 1 }, name: "level_skill_type" },
      { key: { title: 1 }, unique: true, name: "uniq_title" },
    ]),
    db.collection("test_questions").createIndexes([
      { key: { testId: 1, order: 1 }, unique: true, name: "uniq_test_order" },
      { key: { level: 1, skill: 1, topic: 1 }, name: "level_skill_topic" },
    ]),
    db.collection("user_test_attempts").createIndexes([
      { key: { userId: 1, testId: 1, startedAt: -1 }, name: "user_test_recent" },
      { key: { userId: 1, status: 1, startedAt: -1 }, name: "user_status_recent" },
    ]),
    db.collection("writing_tasks").createIndexes([
      { key: { topic: 1, level: 1, type: 1 }, name: "topic_level_type" },
      { key: { title: "text", instructions: "text", topic: "text" }, name: "writing_search" },
    ]),
    db.collection("user_writing_drafts").createIndexes([
      { key: { userId: 1, taskId: 1 }, unique: true, name: "uniq_user_task_draft" },
      { key: { userId: 1, updatedAt: -1 }, name: "user_recent" },
    ]),
    db.collection("user_writing_submissions").createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: "user_recent" },
      { key: { userId: 1, taskId: 1, attemptNumber: 1 }, unique: true, name: "uniq_user_task_attempt" },
    ]),
    db.collection("user_writing_progress").createIndexes([
      { key: { userId: 1, taskId: 1 }, unique: true, name: "uniq_user_task_progress" },
      { key: { userId: 1, status: 1, updatedAt: -1 }, name: "user_status_recent" },
    ]),
    db.collection("daily_stats").createIndexes([
      { key: { userId: 1, date: 1 }, unique: true, name: "uniq_user_date" },
    ]),
    db.collection("focused_practice_sessions").createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: "user_recent" },
      { key: { userId: 1, status: 1, createdAt: -1 }, name: "user_status_recent" },
      { key: { userId: 1, topic: 1, type: 1 }, name: "user_topic_type" },
    ]),
    db.collection("onboarding_questions").createIndexes([
      { key: { order: 1 }, name: "order" },
    ]),
  ]);
}

async function dropIndexIfExists(db: Db, collection: string, indexName: string): Promise<void> {
  const indexes = await db.collection(collection).listIndexes().toArray();
  if (!indexes.some((index) => index.name === indexName)) return;
  await db.collection(collection).dropIndex(indexName);
}

async function dropIndexIfConflicting(
  db: Db,
  collection: string,
  indexName: string,
  expected: { key: Record<string, 1 | -1>; partialFilterExpression?: Record<string, unknown> }
): Promise<void> {
  const indexes = await db.collection(collection).listIndexes().toArray();
  const existing = indexes.find((index) => index.name === indexName);
  if (!existing) return;

  const sameKey = JSON.stringify(existing.key) === JSON.stringify(expected.key);
  const samePartial =
    JSON.stringify(existing.partialFilterExpression ?? {}) === JSON.stringify(expected.partialFilterExpression ?? {});
  if (sameKey && samePartial) return;

  await db.collection(collection).dropIndex(indexName);
}

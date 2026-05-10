import { ObjectId, type Db } from "mongodb";
import { SEED_GRAMMAR } from "@/lib/data/seedGrammar";
import { SEED_ONBOARDING } from "@/lib/data/seedOnboarding";
import { SEED_PLACEMENT_TEST } from "@/lib/data/seedPlacementTest";
import { SEED_READING_TEXTS } from "@/lib/data/seedReading";
import { SEED_TEST_QUESTIONS, SEED_TESTS } from "@/lib/data/seedTests";
import { SEED_VOCABULARY } from "@/lib/data/seedVocabulary";
import { SEED_WRITING_TASKS } from "@/lib/data/seedWriting";
import { COLL } from "@/lib/models/collections";

let seedReady = false;

export async function ensureSeedData(db: Db): Promise<void> {
  if (seedReady) return;
  seedReady = true;

  await Promise.all([
    seedVocabulary(db),
    seedGrammar(db),
    seedOnboarding(db),
    seedPlacement(db),
    seedWriting(db),
    seedReading(db),
    seedTests(db),
  ]).catch((error) => {
    seedReady = false;
    throw error;
  });
}

async function seedVocabulary(db: Db) {
  const coll = db.collection(COLL.vocabulary);
  if (await coll.estimatedDocumentCount()) return;
  const now = new Date();
  await coll.insertMany(
    SEED_VOCABULARY.map((item) => ({
      _id: new ObjectId(),
      ...item,
      isSystem: true,
      createdAt: now,
    })),
    { ordered: false }
  );
}

async function seedGrammar(db: Db) {
  const coll = db.collection(COLL.grammarTopics);
  if (await coll.estimatedDocumentCount()) return;
  await coll.insertMany(
    SEED_GRAMMAR.map((item) => ({
      _id: new ObjectId(),
      ...item,
    })),
    { ordered: false }
  );
}

async function seedOnboarding(db: Db) {
  const coll = db.collection(COLL.onboardingQuestions);
  await Promise.all(
    SEED_ONBOARDING.map((item) =>
      coll.updateOne(
        { key: item.key },
        { $set: item, $setOnInsert: { _id: new ObjectId() } },
        { upsert: true }
      )
    )
  );
}

async function seedPlacement(db: Db) {
  const coll = db.collection(COLL.placementQuestions);
  if (await coll.estimatedDocumentCount()) return;
  await coll.insertMany(
    SEED_PLACEMENT_TEST.map((item) => ({
      _id: new ObjectId(),
      ...item,
    })),
    { ordered: false }
  );
}

async function seedWriting(db: Db) {
  const coll = db.collection(COLL.writingTasks);
  const now = new Date();
  await coll.deleteMany({ level: { $exists: false } });
  await Promise.all(
    SEED_WRITING_TASKS.map((item) =>
      coll.updateOne(
        { title: item.title },
        {
          $set: { ...item, updatedAt: now },
          $setOnInsert: { _id: new ObjectId(), createdAt: now },
        },
        { upsert: true }
      )
    )
  );
}

async function seedReading(db: Db) {
  const coll = db.collection(COLL.readingTexts);
  if (await coll.estimatedDocumentCount()) return;
  const now = new Date();
  await coll.insertMany(
    SEED_READING_TEXTS.map((item) => ({
      _id: new ObjectId(),
      ...item,
      isSystem: true,
      createdAt: now,
    })),
    { ordered: false }
  );
}

async function seedTests(db: Db) {
  const tests = db.collection(COLL.tests);
  const questions = db.collection(COLL.testQuestions);
  const now = new Date();
  const testIdByKey = new Map<string, ObjectId>();

  for (const item of SEED_TESTS) {
    const questionCount = SEED_TEST_QUESTIONS.filter((question) => question.testKey === item.key).length;
    const result = await tests.findOneAndUpdate(
      { title: item.title },
      {
        $set: {
          title: item.title,
          level: item.level,
          skill: item.skill,
          type: item.type,
          timeLimit: item.timeLimit,
          questionsCount: questionCount,
          description: item.description,
          updatedAt: now,
        },
        $setOnInsert: { _id: new ObjectId(), createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );
    if (result?._id) testIdByKey.set(item.key, result._id);
  }

  for (const item of SEED_TEST_QUESTIONS) {
    const testId = testIdByKey.get(item.testKey);
    if (!testId) continue;
    await questions.updateOne(
      { testId, order: item.order },
      {
        $set: {
          type: item.type,
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          level: item.level,
          skill: item.skill,
          topic: item.topic,
        },
        $setOnInsert: { _id: new ObjectId(), testId, order: item.order },
      },
      { upsert: true }
    );
  }
}

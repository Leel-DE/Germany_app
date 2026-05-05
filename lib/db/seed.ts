import { ObjectId, type Db } from "mongodb";
import { SEED_GRAMMAR } from "@/lib/data/seedGrammar";
import { SEED_ONBOARDING } from "@/lib/data/seedOnboarding";
import { SEED_PLACEMENT_TEST } from "@/lib/data/seedPlacementTest";
import { SEED_READING_TEXTS } from "@/lib/data/seedReading";
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
  if (await coll.estimatedDocumentCount()) return;
  await coll.insertMany(
    SEED_WRITING_TASKS.map((item) => ({
      _id: new ObjectId(),
      ...item,
    })),
    { ordered: false }
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

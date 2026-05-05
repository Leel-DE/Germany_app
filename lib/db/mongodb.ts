import { MongoClient, type Db, type MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "deutschmaster";

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Add it to .env.local — see https://www.mongodb.com/atlas (free tier)."
  );
}

const options: MongoClientOptions = {
  retryWrites: true,
  retryReads: true,
  // Sensible pool sizing for serverless (Next.js API routes)
  maxPoolSize: 20,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 8_000,
  // Atlas requires TLS by default; driver handles it from URI
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, hot-reload re-executes modules — reuse the same connection
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error("[mongo] initial connect failed:", err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

let indexesReady = false;
let seedReady = false;
let indexesPromise: Promise<void> | null = null;
let seedPromise: Promise<void> | null = null;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(dbName);
  if (!indexesReady) {
    indexesPromise ??= (await import("./indexes")).ensureIndexes(db);
    await indexesPromise;
    indexesReady = true;
  }
  if (!seedReady) {
    seedPromise ??= (await import("./seed")).ensureSeedData(db);
    await seedPromise;
    seedReady = true;
  }
  return db;
}

export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

export { dbName };

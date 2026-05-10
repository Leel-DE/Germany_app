import type { FullConfig } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { E2E_USER_ID, E2E_USER_PASSWORD, e2eUser, onboardingUser } from "./test-users";

const authFile = ".auth/e2e-user.json";

async function signSessionToken(userId: string, email: string) {
  const secret = process.env.AUTH_SECRET ?? "development-only-secret-change-me-12345678";
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("deutschmaster")
    .setAudience("deutschmaster-app")
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(new TextEncoder().encode(secret));
}

async function seedMongoUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required for e2e auth reuse because dashboard layouts read users on the server.");
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 });
  await client.connect();
  try {
    const db = client.db(process.env.MONGODB_DB ?? "deutschmaster");
    const users = db.collection("users");
    const passwordHash = await bcrypt.hash(E2E_USER_PASSWORD, 10);
    const now = new Date();

    for (const user of [e2eUser, onboardingUser]) {
      await users.updateOne(
        { _id: new ObjectId(user.id) },
        {
          $set: {
            email: user.email,
            passwordHash,
            name: user.name,
            nativeLanguage: user.nativeLanguage,
            currentGermanLevel: user.currentGermanLevel,
            targetGermanLevel: user.targetGermanLevel,
            learningGoals: user.learningGoals,
            profession: user.profession,
            studyPurpose: user.studyPurpose,
            dailyStudyMinutes: user.dailyStudyMinutes,
            studyDaysPerWeek: user.studyDaysPerWeek,
            preferredFormats: user.preferredFormats,
            preferredTopics: user.preferredTopics,
            weakSkills: user.weakSkills,
            weakGrammarAreas: user.weakGrammarAreas,
            onboardingCompleted: user.onboardingCompleted,
            placementTestCompleted: user.placementTestCompleted,
            streakCount: user.streakCount,
            streakLastDate: user.streakLastDate,
            totalStudyDays: user.totalStudyDays,
            interfaceTheme: user.interfaceTheme,
            updatedAt: now,
          },
          $setOnInsert: { _id: new ObjectId(user.id), createdAt: now },
        },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
}

export default async function globalSetup(config: FullConfig) {
  await seedMongoUsers();

  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000";
  const url = new URL(String(baseURL));
  const token = await signSessionToken(E2E_USER_ID, e2eUser.email);

  mkdirSync(dirname(authFile), { recursive: true });
  writeFileSync(
    authFile,
    JSON.stringify(
      {
        cookies: [
          {
            name: "dm_session",
            value: token,
            domain: url.hostname,
            path: "/",
            expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: url.protocol === "https:",
            sameSite: "Lax",
          },
        ],
        origins: [],
      },
      null,
      2
    )
  );
}

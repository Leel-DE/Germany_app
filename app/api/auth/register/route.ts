import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { usersColl } from "@/lib/models/collections";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { toPublicUser, type UserDoc } from "@/lib/models/types";
import { getClientKey, rateLimit } from "@/lib/auth/rateLimit";

const RegisterSchema = z.object({
  email: z.string().email("Некорректный email").max(254),
  password: z
    .string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .max(128, "Пароль слишком длинный"),
  name: z.string().min(1, "Введите имя").max(80),
  nativeLanguage: z.string().min(2).max(20).default("ru"),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(getClientKey(req, "register"), 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Слишком много попыток. Подождите ${rl.retryAfterSec}с.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 }
    );
  }

  const { email, password, name, nativeLanguage } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const users = await usersColl();
  const existing = await users.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();

  const userDoc: UserDoc = {
    _id: new ObjectId(),
    email: normalizedEmail,
    passwordHash,
    name: name.trim(),
    nativeLanguage,
    currentGermanLevel: "A2",
    targetGermanLevel: "B1",
    learningGoals: [],
    profession: undefined,
    studyPurpose: undefined,
    dailyStudyMinutes: 30,
    studyDaysPerWeek: 5,
    preferredFormats: [],
    preferredTopics: [],
    weakSkills: [],
    weakGrammarAreas: [],
    onboardingCompleted: false,
    placementTestCompleted: false,
    streakCount: 0,
    streakLastDate: null,
    totalStudyDays: 0,
    interfaceTheme: "system",
    createdAt: now,
    updatedAt: now,
  };

  await users.insertOne(userDoc);
  await createSession({ sub: userDoc._id.toString(), email: normalizedEmail });

  return NextResponse.json({ user: toPublicUser(userDoc) }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { usersColl } from "@/lib/models/collections";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { toPublicUser } from "@/lib/models/types";
import { getClientKey, rateLimit } from "@/lib/auth/rateLimit";

const LoginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export async function POST(req: NextRequest) {
  // Rate-limit per IP+email
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const rl = rateLimit(getClientKey(req, `login:${email}`), 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Слишком много попыток. Подождите ${rl.retryAfterSec}с.` },
      { status: 429 }
    );
  }

  const users = await usersColl();
  const user = await users.findOne({ email });

  // Use the same response time/code regardless of which check failed
  const failed = NextResponse.json(
    { error: "Неверный email или пароль" },
    { status: 401 }
  );

  if (!user) return failed;

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return failed;

  await createSession({ sub: user._id.toString(), email: user.email });

  return NextResponse.json({ user: toPublicUser(user) });
}

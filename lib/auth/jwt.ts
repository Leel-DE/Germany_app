import { SignJWT, jwtVerify, errors } from "jose";

const SECRET = process.env.AUTH_SECRET;
if (!SECRET || SECRET.length < 32) {
  // Allow short secrets in dev with a clear warning
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set and at least 32 characters in production");
  }
}

const encodedSecret = new TextEncoder().encode(
  SECRET ?? "development-only-secret-change-me-12345678"
);

const ISSUER = "deutschmaster";
const AUDIENCE = "deutschmaster-app";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string; // userId
  email: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(encodedSecret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch (e) {
    if (
      e instanceof errors.JWTExpired ||
      e instanceof errors.JWTInvalid ||
      e instanceof errors.JWSInvalid ||
      e instanceof errors.JWSSignatureVerificationFailed
    ) {
      return null;
    }
    return null;
  }
}

export const TOKEN_TTL = TOKEN_TTL_SECONDS;

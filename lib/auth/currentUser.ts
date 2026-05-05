import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { usersColl } from "@/lib/models/collections";
import type { UserDoc } from "@/lib/models/types";
import { getSessionToken } from "./session";
import { verifySessionToken } from "./jwt";

/**
 * Returns the authenticated user document, or null if no/invalid session.
 * Use ONLY in server contexts (API routes, Server Components, route handlers).
 */
export async function getCurrentUser(): Promise<UserDoc | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  let oid: ObjectId;
  try {
    oid = new ObjectId(payload.sub);
  } catch {
    return null;
  }

  const users = await usersColl();
  const user = await users.findOne({ _id: oid });
  return user ?? null;
}

/**
 * Helper for API routes — returns user or 401 response.
 * Usage:
 *   const auth = await requireUser();
 *   if ("response" in auth) return auth.response;
 *   const user = auth.user;
 */
export async function requireUser():
  Promise<{ user: UserDoc } | { response: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}

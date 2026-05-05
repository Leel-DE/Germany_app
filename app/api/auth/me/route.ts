import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { toPublicUser } from "@/lib/models/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}

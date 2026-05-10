import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";

export async function POST() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  return NextResponse.json(
    { error: "Use POST /api/writing/:taskId/check so the submission includes validated AI feedback." },
    { status: 410 }
  );
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/currentUser";
import { getCurrentRecommendation } from "@/lib/focused-practice/service";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  return NextResponse.json(await getCurrentRecommendation(auth.user));
}

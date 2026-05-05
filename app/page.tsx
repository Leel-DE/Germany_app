import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/onboarding");
  if (!user.placementTestCompleted) redirect("/onboarding/placement-test");
  redirect("/home");
}

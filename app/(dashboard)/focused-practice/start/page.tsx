"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FocusedPracticeStartPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function start() {
      try {
        const res = await fetch("/api/focused-practice/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: params.get("topic") ?? undefined,
            type: params.get("type") ?? undefined,
          }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Could not start practice");
        router.replace(body.redirectUrl);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not start practice");
      }
    }
    start();
    return () => {
      alive = false;
    };
  }, [params, router]);

  if (error) {
    return (
      <main className="mx-auto max-w-xl rounded-lg border border-destructive/30 bg-card p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <h1 className="font-semibold">Practice could not start</h1>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/tests")}>Back to tests</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-[50vh] place-items-center text-center text-muted-foreground">
      <div>
        <Loader2 className="mx-auto h-7 w-7 animate-spin" />
        <p className="mt-3 text-sm">Starting focused practice...</p>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tAuth = useTranslations("auth");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(tAuth("errorPasswordShort"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, nativeLanguage: "ru" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? tAuth("errorRegister"));
        return;
      }
      setUser(data.user);
      router.replace("/onboarding");
      router.refresh();
    } catch {
      setError(tAuth("errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-bold mb-1">{tAuth("registerTitle")}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {tAuth("registerSubtitle")}
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{tAuth("name")}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoComplete="name"
              placeholder="Артур"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{tAuth("email")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{tAuth("password")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              autoComplete="new-password"
              placeholder={tAuth("passwordMin")}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-again/10 text-again px-3 py-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full h-11 mt-1" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tAuth("signUp")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        {tAuth("haveAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {tAuth("goLogin")}
        </Link>
      </p>
    </div>
  );
}

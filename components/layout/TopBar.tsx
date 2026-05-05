"use client";
import Link from "next/link";
import { Flame, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

interface TopBarProps {
  streakCount?: number;
}

export function TopBar({ streakCount = 0 }: TopBarProps) {
  const { logout } = useAuth();
  const tCommon = useTranslations("common");

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card/90 backdrop-blur border-b border-border">
      <Link href="/home" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
          DE
        </div>
        <span className="font-semibold text-sm">DeutschMaster</span>
      </Link>

      <div className="flex items-center gap-2">
        <LanguageSwitcher compact />
        {streakCount > 0 && (
          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Flame className={cn("w-3.5 h-3.5 streak-fire")} />
            <span>{streakCount}</span>
          </div>
        )}
        <button
          onClick={logout}
          aria-label={tCommon("logout")}
          title={tCommon("logout")}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

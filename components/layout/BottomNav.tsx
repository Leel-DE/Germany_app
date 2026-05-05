"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Layers, GraduationCap, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const mobileNav = [
  { href: "/home", icon: LayoutDashboard, key: "home" },
  { href: "/vocabulary", icon: BookOpen, key: "vocabulary" },
  { href: "/daily-plan", icon: Layers, key: "dailyPlan", primary: true },
  { href: "/grammar", icon: GraduationCap, key: "grammar" },
  { href: "/progress", icon: BarChart2, key: "progress" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const tNav = useTranslations("navigation");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-inset-bottom">
      <ul className="flex items-center justify-around h-16">
        {mobileNav.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full w-full transition-all duration-150",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.primary ? (
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all",
                    active ? "bg-primary shadow-md scale-105" : "bg-primary/10"
                  )}>
                    <item.icon className={cn("w-5 h-5", active ? "text-white" : "text-primary")} />
                  </div>
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
                {!item.primary && (
                  <span className="text-[10px] font-medium leading-none">{tNav(item.key)}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

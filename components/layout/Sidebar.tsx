"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Layers, GraduationCap, FileText,
  Headphones, Mic, ClipboardList, Bot, BarChart2, Settings, Flame, Sun, Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

const navItems = [
  { href: "/home", icon: LayoutDashboard, label: "Главная" },
  { href: "/daily-plan", icon: Layers, label: "Занятие дня", highlight: true },
  { href: "/vocabulary", icon: BookOpen, label: "Словарь" },
  { href: "/srs", icon: Flame, label: "Повторение" },
  { href: "/grammar", icon: GraduationCap, label: "Грамматика" },
  { href: "/writing", icon: FileText, label: "Письмо" },
  { href: "/reading", icon: BookOpen, label: "Чтение" },
  { href: "/listening", icon: Headphones, label: "Аудирование" },
  { href: "/speaking", icon: Mic, label: "Разговор" },
  { href: "/tests", icon: ClipboardList, label: "Тесты" },
  { href: "/ai-tutor", icon: Bot, label: "AI-тьютор" },
  { href: "/progress", icon: BarChart2, label: "Прогресс" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-border bg-card sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
            DE
          </div>
          <div>
            <p className="font-bold text-sm leading-none">DeutschMaster</p>
            <p className="text-xs text-muted-foreground mt-0.5">A2 → B1/B2</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    item.highlight && !active && "text-primary"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.highlight && !active && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings + Theme */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Настройки</span>
        </Link>
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          {resolvedTheme === "dark"
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />}
          <span>{resolvedTheme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
        </button>
      </div>
    </aside>
  );
}

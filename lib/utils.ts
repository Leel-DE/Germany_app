import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${count} ${many}`;
  if (mod10 === 1) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

export function getArticleColor(article: string | null | undefined): string {
  if (!article) return "text-muted-foreground";
  const art = article.toLowerCase().replace("die (pl)", "pl");
  if (art === "der") return "text-blue-600 dark:text-blue-400";
  if (art === "die") return "text-red-500 dark:text-red-400";
  if (art === "das") return "text-green-600 dark:text-green-400";
  return "text-muted-foreground";
}

export function getLevelColor(level: string): string {
  if (level === "A1") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (level === "A2") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (level === "B1") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (level === "B2") return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-muted text-muted-foreground";
}

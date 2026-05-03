import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "purple" | "green" | "orange";
  sublabel?: string;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

export function StatCard({ label, value, icon: Icon, color = "blue", sublabel }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

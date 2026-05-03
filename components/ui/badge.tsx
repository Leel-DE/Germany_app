import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        muted: "bg-muted text-muted-foreground",
        a1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        a2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        b1: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        b2: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

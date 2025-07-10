import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "light" | "medium";
}

export function GlassPanel({ children, className, variant = "light" }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-xl",
        variant === "light" ? "glass-panel" : "glass-panel-medium",
        className
      )}
    >
      {children}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: string;
}

export function Chip({ label, active = false, onClick, className, icon }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 select-none",
        active
          ? "bg-navy text-white shadow-sm"
          : "bg-white text-muted border border-sand-dark hover:border-navy hover:text-navy",
        onClick && "cursor-pointer",
        !onClick && "cursor-default",
        className
      )}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

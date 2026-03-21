"use client";

import { cn } from "@/lib/utils";

// ── Spinner ───────────────────────────────────────────────
interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const spinnerSizes = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent",
          spinnerSizes[size]
        )}
      />
      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-sand",
        className
      )}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-sand bg-white p-5 shadow-card">
      <div className="mb-3 flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="mt-4 flex gap-2 border-t border-sand pt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

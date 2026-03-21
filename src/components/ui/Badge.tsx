import { cn } from "@/lib/utils";

type BadgeVariant =
  | "eligible"
  | "ineligible"
  | "likely"
  | "pending"
  | "housing"
  | "health"
  | "agriculture"
  | "finance"
  | "education"
  | "other"
  | "mvp"
  | "phase2"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  eligible: "bg-scheme-green-bg text-scheme-green border-green-200",
  ineligible: "bg-scheme-red-bg text-scheme-red border-red-200",
  likely: "bg-scheme-yellow-bg text-scheme-yellow border-yellow-200",
  pending: "bg-scheme-yellow-bg text-scheme-yellow border-yellow-200",
  housing: "bg-blue-50 text-blue-700 border-blue-200",
  health: "bg-scheme-red-bg text-scheme-red border-red-200",
  agriculture: "bg-scheme-green-bg text-scheme-green border-green-200",
  finance: "bg-scheme-yellow-bg text-scheme-yellow border-yellow-200",
  education: "bg-scheme-purple-bg text-scheme-purple border-purple-200",
  other: "bg-sand text-muted border-sand-dark",
  mvp: "bg-brand-orange-light text-brand-orange border-orange-200",
  phase2: "bg-scheme-teal-bg text-scheme-teal border-teal-200",
  default: "bg-navy-50 text-navy border-navy-100",
};

const dotColors: Record<BadgeVariant, string> = {
  eligible: "bg-scheme-green",
  ineligible: "bg-scheme-red",
  likely: "bg-scheme-yellow",
  pending: "bg-scheme-yellow",
  housing: "bg-blue-500",
  health: "bg-scheme-red",
  agriculture: "bg-scheme-green",
  finance: "bg-scheme-yellow",
  education: "bg-scheme-purple",
  other: "bg-muted",
  mvp: "bg-brand-orange",
  phase2: "bg-scheme-teal",
  default: "bg-navy",
};

export function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

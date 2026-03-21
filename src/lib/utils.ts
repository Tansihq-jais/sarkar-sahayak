import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format file size to human readable */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format large numbers with Indian number system (e.g. 1,00,000) */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Generate a random UUID */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Capitalise first letter */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Scheme category display labels */
export const CATEGORY_LABELS: Record<string, string> = {
  housing: "Housing",
  health: "Health",
  agriculture: "Agriculture",
  finance: "Finance",
  education: "Education",
  other: "Other",
};

/** Scheme category colors */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  housing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  health: { bg: "bg-scheme-red-bg", text: "text-scheme-red", border: "border-red-200" },
  agriculture: { bg: "bg-scheme-green-bg", text: "text-scheme-green", border: "border-green-200" },
  finance: { bg: "bg-scheme-yellow-bg", text: "text-scheme-yellow", border: "border-yellow-200" },
  education: { bg: "bg-scheme-purple-bg", text: "text-scheme-purple", border: "border-purple-200" },
  other: { bg: "bg-sand", text: "text-muted", border: "border-sand-dark" },
};

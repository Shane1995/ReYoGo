import { cn } from "@/lib/utils";

export function segBtn(active: boolean) {
  return cn(
    "rounded-md px-3 py-1 text-sm transition-colors",
    active ? "bg-[var(--nav-active-border)] text-white" : "text-muted-foreground hover:text-foreground"
  );
}

export function changeCls(v: number | null, bold = false) {
  return cn(
    "font-mono",
    bold && "font-semibold",
    v === null ? "text-muted-foreground"
    : v > 0 ? "text-destructive"
    : v < 0 ? "text-green-600 dark:text-green-500"
    : "text-muted-foreground"
  );
}

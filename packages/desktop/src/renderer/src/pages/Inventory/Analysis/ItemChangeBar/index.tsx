import { cn } from "@/lib/utils";
import { fmtPct } from "../utils/format";

export function ItemChangeBar({ name, change, maxAbs }: { name: string; change: number; maxAbs: number }) {
  const widthPct = maxAbs > 0 ? (Math.abs(change) / maxAbs) * 100 : 100;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{name}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", change > 0 ? "bg-destructive/65" : "bg-green-600/60")}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className={cn("w-12 shrink-0 text-right text-xs font-mono font-medium",
        change > 0 ? "text-destructive" : "text-green-600 dark:text-green-500")}>
        {fmtPct(change)}
      </span>
    </div>
  );
}

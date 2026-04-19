import { cn } from "@/lib/utils";
import { Sparkline } from "../Sparkline";
import { fmt, fmtDate, fmtPct } from "../utils/format";
import { overallChangePct } from "../utils/stats";
import type { ItemGroup } from "../types";

export function ItemCard({ group, onSelect }: { group: ItemGroup; onSelect: () => void }) {
  const last = group.entries[group.entries.length - 1];
  const change = overallChangePct(group);
  const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
  const maxPrice = Math.max(...group.entries.map((e) => e.unitPrice));

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-3 rounded-lg border border-[var(--nav-border)] bg-background p-4 text-left transition-colors hover:bg-muted/20 hover:border-[var(--nav-active-border)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-active-border)]/50"
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm text-foreground">{group.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{group.uom ?? "no UoM"}</p>
        </div>
        {change !== null && (
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold font-mono",
            change > 0
              ? "bg-destructive/10 text-destructive"
              : change < 0
              ? "bg-green-600/10 text-green-600 dark:text-green-500"
              : "bg-muted text-muted-foreground"
          )}>
            {fmtPct(change)}
          </span>
        )}
      </div>
      <div className="w-full overflow-hidden rounded">
        <Sparkline entries={group.entries} />
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div>
          <p className="text-muted-foreground">Last price</p>
          <p className="font-mono font-medium text-foreground mt-0.5">{fmt(last.unitPrice)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Range</p>
          <p className="font-mono text-foreground mt-0.5">{fmt(minPrice)}–{fmt(maxPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Captures</p>
          <p className="font-medium text-foreground mt-0.5">{group.entries.length}</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-1">Last: {fmtDate(last.date)}</p>
    </button>
  );
}

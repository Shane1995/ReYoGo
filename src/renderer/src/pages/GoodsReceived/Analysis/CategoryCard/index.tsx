import { cn } from "@/lib/utils";
import { ItemChangeBar } from "../ItemChangeBar";
import { fmtPct } from "../utils/format";
import { overallChangePct } from "../utils/stats";
import { typeLabel } from "../types";
import type { ItemGroup } from "../types";

export function CategoryCard({ type, groups, onSelect }: { type: string; groups: ItemGroup[]; onSelect: () => void }) {
  const changes = groups.map((g) => ({ name: g.name, change: overallChangePct(g) }));
  const withChange = changes.filter((c): c is { name: string; change: number } => c.change !== null);
  const noChange = changes.filter((c) => c.change === null);

  const increased = withChange.filter((c) => c.change > 0).length;
  const decreased = withChange.filter((c) => c.change < 0).length;
  const avgChange = withChange.length > 0
    ? withChange.reduce((s, c) => s + c.change, 0) / withChange.length : null;

  const sorted = [...withChange].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const maxAbs = sorted.length > 0 ? Math.max(...sorted.map((c) => Math.abs(c.change))) : 1;
  const shown = sorted.slice(0, 6);
  const hidden = sorted.length - shown.length + noChange.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-3 rounded-lg border border-[var(--nav-border)] bg-background p-4 text-left transition-colors hover:bg-muted/20 hover:border-[var(--nav-active-border)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-active-border)]/50 w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{typeLabel(type)}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{groups.length} item{groups.length !== 1 ? "s" : ""}</span>
            {increased > 0 && <span className="text-destructive">{increased} up</span>}
            {decreased > 0 && <span className="text-green-600 dark:text-green-500">{decreased} down</span>}
          </div>
        </div>
        {avgChange !== null && (
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold font-mono",
            avgChange > 0 ? "bg-destructive/10 text-destructive"
            : avgChange < 0 ? "bg-green-600/10 text-green-600 dark:text-green-500"
            : "bg-muted text-muted-foreground"
          )}>
            avg {fmtPct(avgChange)}
          </span>
        )}
      </div>
      {shown.length > 0 ? (
        <div className="w-full space-y-0.5">
          {shown.map((c) => (
            <ItemChangeBar key={c.name} name={c.name} change={c.change} maxAbs={maxAbs} />
          ))}
          {hidden > 0 && (
            <p className="pt-1 text-xs text-muted-foreground">+{hidden} more</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No price change data yet — items have only one capture.</p>
      )}
    </button>
  );
}

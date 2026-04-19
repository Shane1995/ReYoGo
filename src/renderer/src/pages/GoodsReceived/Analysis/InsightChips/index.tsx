import { cn } from "@/lib/utils";
import { fmtPct } from "../utils/format";
import { changeCls } from "../utils/styles";
import type { GroupStats } from "../utils/stats";

export function InsightChips({ stats }: { stats: GroupStats }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">
        {stats.count} item{stats.count !== 1 ? "s" : ""}
      </span>
      {stats.avgChange !== null && (
        <span className={cn("font-mono font-medium", changeCls(stats.avgChange))}>
          avg {fmtPct(stats.avgChange)}
        </span>
      )}
      {stats.increased > 0 && (
        <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 font-medium text-destructive">
          {stats.increased} ↑
        </span>
      )}
      {stats.decreased > 0 && (
        <span className="rounded-full bg-green-600/10 px-1.5 py-0.5 font-medium text-green-600 dark:text-green-500">
          {stats.decreased} ↓
        </span>
      )}
    </div>
  );
}

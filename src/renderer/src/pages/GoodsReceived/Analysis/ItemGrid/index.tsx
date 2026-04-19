import { ItemCard } from "../ItemCard";
import { overallChangePct } from "../utils/stats";
import type { ItemGroup } from "../types";

export function ItemGrid({ groups, onSelect }: { groups: ItemGroup[]; onSelect: (id: string) => void }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
        No data for the selected range or search.
      </div>
    );
  }

  const changes = groups.map(overallChangePct).filter((v): v is number => v !== null);
  const increased = changes.filter((v) => v > 0).length;
  const decreased = changes.filter((v) => v < 0).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{groups.length} item{groups.length !== 1 ? "s" : ""}</span>
        {increased > 0 && <span className="text-destructive font-medium">{increased} increased</span>}
        {decreased > 0 && <span className="text-green-600 dark:text-green-500 font-medium">{decreased} decreased</span>}
        <span className="ml-auto text-muted-foreground">Click an item to inspect</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {groups.map((group) => (
          <ItemCard key={group.itemId} group={group} onSelect={() => onSelect(group.itemId)} />
        ))}
      </div>
    </div>
  );
}

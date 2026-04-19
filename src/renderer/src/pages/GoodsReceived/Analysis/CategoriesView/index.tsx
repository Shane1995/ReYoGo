import { useMemo, useState } from "react";
import { CategoryCard } from "../CategoryCard";
import { ItemGrid } from "../ItemGrid";
import { ItemDetail } from "../ItemDetail";
import { overallChangePct } from "../utils/stats";
import { typeLabel, TYPE_ORDER } from "../types";
import type { ItemGroup } from "../types";

export function CategoriesView({ allGroups }: { allGroups: ItemGroup[] }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, ItemGroup[]>();
    for (const g of allGroups) {
      if (!map.has(g.categoryType)) map.set(g.categoryType, []);
      map.get(g.categoryType)!.push(g);
    }
    return [
      ...TYPE_ORDER.filter((t) => map.has(t)).map((t) => ({ type: t, groups: map.get(t)! })),
      ...Array.from(map.entries()).filter(([t]) => !TYPE_ORDER.includes(t)).map(([t, gs]) => ({ type: t, groups: gs })),
    ];
  }, [allGroups]);

  const catGroups = selectedType ? allGroups.filter((g) => g.categoryType === selectedType) : [];
  const selectedGroup = selectedItemId ? catGroups.find((g) => g.itemId === selectedItemId) ?? null : null;

  if (selectedGroup) {
    return <ItemDetail group={selectedGroup} onBack={() => setSelectedItemId(null)} />;
  }

  if (selectedType) {
    const changes = catGroups.map(overallChangePct).filter((v): v is number => v !== null);
    const increased = changes.filter((v) => v > 0).length;
    const decreased = changes.filter((v) => v < 0).length;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedType(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>←</span>
            <span>Categories</span>
          </button>
          <span className="text-muted-foreground/40">/</span>
          <h2 className="text-sm font-semibold text-foreground">{typeLabel(selectedType)}</h2>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span>{catGroups.length} item{catGroups.length !== 1 ? "s" : ""}</span>
            {increased > 0 && <span className="text-destructive">{increased} up</span>}
            {decreased > 0 && <span className="text-green-600 dark:text-green-500">{decreased} down</span>}
          </div>
        </div>
        <ItemGrid groups={catGroups} onSelect={setSelectedItemId} />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
        No data for the selected range or search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Click a category to explore items</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {categories.map(({ type, groups }) => (
          <CategoryCard key={type} type={type} groups={groups} onSelect={() => setSelectedType(type)} />
        ))}
      </div>
    </div>
  );
}

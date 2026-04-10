import { Fragment, useState, useCallback } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PackageIcon,
  UtensilsIcon,
  GlassWaterIcon,
  SearchIcon,
  XIcon,
  LineChartIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TYPE_LABELS, TYPE_VALUES } from "../types";
import type { TypeValue, InventoryCategory, InventoryItem } from "../types";

const TYPE_CONFIG: Record<TypeValue, {
  color: string;
  badgeClass: string;
  treeLine: string;
  icon: React.FC<{ className?: string }>;
}> = {
  food: {
    color: "text-emerald-700 dark:text-emerald-400",
    badgeClass: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    treeLine: "border-emerald-200 dark:border-emerald-800",
    icon: UtensilsIcon,
  },
  drink: {
    color: "text-sky-700 dark:text-sky-400",
    badgeClass: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300",
    treeLine: "border-sky-200 dark:border-sky-800",
    icon: GlassWaterIcon,
  },
  "non-perishable": {
    color: "text-amber-700 dark:text-amber-400",
    badgeClass: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    treeLine: "border-amber-200 dark:border-amber-800",
    icon: PackageIcon,
  },
};

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100 px-0">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

type Props = {
  categories: InventoryCategory[];
  items: InventoryItem[];
  onViewInsights: (itemId: string) => void;
};

export function InventoryViewTable({ categories, items, onViewInsights }: Props) {
  const [expandedTypes, setExpandedTypes] = useState<Set<TypeValue>>(() => new Set(TYPE_VALUES));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const toggleType = useCallback((type: TypeValue) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const totalCategories = categories.filter((c) => c.name.trim()).length;
  const totalItems = items.length;

  return (
    <div className="space-y-3">
      {/* Search + summary */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or items…"
            className="h-8 w-full rounded-md bg-transparent pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <div className="h-5 w-px bg-border shrink-0" />
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCategories}</span> categories
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{totalItems}</span> items
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {TYPE_VALUES.map((type) => {
            const cfg = TYPE_CONFIG[type];
            const TypeIcon = cfg.icon;
            const count = items.filter((i) => i.type === type).length;
            return (
              <span key={type} className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <TypeIcon className={cn("size-3.5", cfg.color)} />
                {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Type sections */}
      {TYPE_VALUES.map((type) => {
        const cfg = TYPE_CONFIG[type];
        const TypeIcon = cfg.icon;
        const isExpanded = expandedTypes.has(type);
        const typeCategories = categories.filter((c) => c.type === type && c.name.trim());
        const typeItemCount = items.filter((i) => i.type === type).length;

        const filteredCategories = !query
          ? typeCategories
          : typeCategories.filter((cat) =>
              cat.name.toLowerCase().includes(query) ||
              items.some((i) => i.categoryId === cat.id && i.name.toLowerCase().includes(query))
            );

        if (query && filteredCategories.length === 0) return null;

        return (
          <div key={type} className="overflow-hidden rounded-xl border border-border bg-background">
            {/* Type header — full-width toggle button, no nested buttons */}
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40"
              onClick={() => toggleType(type)}
            >
              <span className="shrink-0 text-muted-foreground">
                {isExpanded
                  ? <ChevronDownIcon className="size-4" />
                  : <ChevronRightIcon className="size-4" />}
              </span>
              <TypeIcon className={cn("size-4 shrink-0", cfg.color)} />
              <span className="font-semibold text-sm text-foreground">{TYPE_LABELS[type]}</span>
              <Badge className={cn("text-[11px] font-medium", cfg.badgeClass)}>
                {typeCategories.length} categories · {typeItemCount} items
              </Badge>
            </button>

            {isExpanded && (
              <>
                {filteredCategories.length === 0 ? (
                  <p className="border-t border-border py-6 text-center text-sm text-muted-foreground">
                    No categories.
                  </p>
                ) : (
                  /* Left-border tree container, indented from type header */
                  <div className={cn("ml-9 mr-4 mb-3 mt-1 space-y-1")}>
                    {filteredCategories.map((category) => {
                      const allCategoryItems = items.filter((i) => i.categoryId === category.id);
                      const categoryItems = !query
                        ? allCategoryItems
                        : category.name.toLowerCase().includes(query)
                          ? allCategoryItems
                          : allCategoryItems.filter((i) => i.name.toLowerCase().includes(query));

                      const isCategoryExpanded = query
                        ? categoryItems.length > 0
                        : expandedCategories.has(category.id);

                      return (
                        <Fragment key={category.id}>
                          {/* Category row */}
                          <div
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                              "border border-border/60 bg-muted/30 hover:bg-muted/60"
                            )}
                            onClick={() => !query && toggleCategory(category.id)}
                          >
                            <span className="shrink-0 text-muted-foreground">
                              {allCategoryItems.length > 0 ? (
                                isCategoryExpanded
                                  ? <ChevronDownIcon className="size-3.5" />
                                  : <ChevronRightIcon className="size-3.5" />
                              ) : (
                                <span className="inline-block size-3.5" />
                              )}
                            </span>
                            <span className="flex-1 text-sm font-semibold text-foreground">
                              <Highlight text={category.name} query={query} />
                            </span>
                            {allCategoryItems.length > 0 && (
                              <Badge variant="secondary" className="text-[10px] tabular-nums">
                                {allCategoryItems.length} item{allCategoryItems.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>

                          {/* Items — indented further with a coloured left border */}
                          {isCategoryExpanded && categoryItems.length > 0 && (
                            <div className={cn("ml-5 border-l-2 pl-3", cfg.treeLine)}>
                              {/* Column headers */}
                              <div className="mb-0.5 grid grid-cols-[1fr_5rem_2rem] gap-2 px-2 pb-1 pt-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</span>
                                <span />
                              </div>
                              {/* Item rows */}
                              <div className="divide-y divide-border/40 overflow-hidden rounded-md border border-border/60 bg-background">
                                {categoryItems.map((item, idx) => (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      "grid grid-cols-[1fr_5rem_2rem] items-center gap-2 px-3 py-2 text-sm",
                                      idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                                    )}
                                  >
                                    <span className="truncate text-foreground/80">
                                      <Highlight text={item.name} query={query} />
                                    </span>
                                    <span>
                                      {item.unitOfMeasure ? (
                                        <Badge variant="secondary" className="text-xs font-normal">
                                          {item.unitOfMeasure}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground/50">—</span>
                                      )}
                                    </span>
                                    <button
                                      type="button"
                                      title="View cost insights"
                                      onClick={() => onViewInsights(item.id)}
                                      className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                      <LineChartIcon className="size-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* No search results */}
      {query && TYPE_VALUES.every((type) => {
        const typeCategories = categories.filter((c) => c.type === type && c.name.trim());
        return !typeCategories.some(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            items.some((i) => i.categoryId === cat.id && i.name.toLowerCase().includes(query))
        );
      }) && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background py-12 text-center">
          <SearchIcon className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No results for "{search}"</p>
          <Button type="button" variant="outline" size="sm" className="mt-2 text-xs" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}

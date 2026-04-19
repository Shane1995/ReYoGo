import { SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterField, FilterValues } from "./types";

type Props = {
  filters: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string) => void;
  onClearAll: () => void;
};

export function FilterBar({ filters, values, onChange, onClearAll }: Props) {
  const searchFilter = filters.find((f) => f.type === "search");
  const selectFilters = filters.filter((f) => f.type === "select");
  const hasAny = filters.some((f) => values[f.key]);

  return (
    <div className="border-b border-border bg-background px-4 py-3 space-y-2">
      {searchFilter && (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={searchFilter.placeholder ?? `Search ${searchFilter.label.toLowerCase()}…`}
            value={values[searchFilter.key] ?? ""}
            onChange={(e) => onChange(searchFilter.key, e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {values[searchFilter.key] && (
            <button
              type="button"
              onClick={() => onChange(searchFilter.key, "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {selectFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          {selectFilters.map((filter) => (
            <select
              key={filter.key}
              value={values[filter.key] ?? ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className={cn(
                "h-8 rounded-md border border-input bg-background px-2.5 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40",
                values[filter.key] ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <option value="">All {filter.label}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
          {hasAny && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

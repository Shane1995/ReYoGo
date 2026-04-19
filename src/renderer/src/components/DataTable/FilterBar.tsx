import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterField, FilterOption, FilterValues } from "./types";

type Props = {
  filters: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string | string[]) => void;
  onClearAll: () => void;
};

function MultiSelectDropdown({
  filter,
  selected,
  options,
  onChange,
}: {
  filter: FilterField;
  selected: string[];
  options: FilterOption[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40",
          selected.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {selected.length === 0
          ? `All ${filter.label}`
          : `${selected.length} ${filter.label}`}
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
          ) : (
            options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="size-3.5 cursor-pointer accent-primary [color-scheme:dark]"
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, values, onChange, onClearAll }: Props) {
  const searchFilter = filters.find((f) => f.type === "search");
  const selectFilters = filters.filter((f) => f.type === "select");

  const activeChips: { key: string; value: string; fieldLabel: string; label: string }[] = [];
  for (const f of filters) {
    const raw = f.options;
    const opts = typeof raw === "function" ? raw(values) : raw ?? [];
    const val = values[f.key];
    if (!val || (Array.isArray(val) && val.length === 0)) continue;

    if (f.multi && Array.isArray(val)) {
      for (const v of val) {
        const label = opts.find((o) => o.value === v)?.label ?? v;
        activeChips.push({ key: f.key, value: v, fieldLabel: f.label, label });
      }
    } else if (!f.multi && typeof val === "string" && val) {
      const label = f.type === "search" ? val : opts.find((o) => o.value === val)?.label ?? val;
      activeChips.push({ key: f.key, value: val, fieldLabel: f.label, label });
    }
  }

  function removeChip(key: string, value: string) {
    const field = filters.find((f) => f.key === key);
    if (field?.multi) {
      const current = (values[key] as string[]) ?? [];
      onChange(key, current.filter((v) => v !== value));
    } else {
      onChange(key, "");
    }
  }

  return (
    <div className="border-b border-border bg-background px-4 pt-3 pb-2.5 space-y-2">
      {searchFilter && (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={searchFilter.placeholder ?? `Search ${searchFilter.label.toLowerCase()}…`}
            value={(values[searchFilter.key] as string) ?? ""}
            onChange={(e) => onChange(searchFilter.key, e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-muted pl-8 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
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
        <div className="flex flex-wrap items-center gap-2">
          {selectFilters.map((filter) => {
            const raw = filter.options;
            const opts = typeof raw === "function" ? raw(values) : raw ?? [];

            if (filter.multi) {
              return (
                <MultiSelectDropdown
                  key={filter.key}
                  filter={filter}
                  selected={(values[filter.key] as string[]) ?? []}
                  options={opts}
                  onChange={(val) => onChange(filter.key, val)}
                />
              );
            }

            return (
              <select
                key={filter.key}
                value={(values[filter.key] as string) ?? ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className={cn(
                  "h-8 rounded-md border border-input bg-muted px-2.5 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40",
                  values[filter.key] ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <option value="">All {filter.label}</option>
                {opts.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          })}
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeChips.map((chip) => (
            <span
              key={`${chip.key}:${chip.value}`}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              <span className="text-primary/60">{chip.fieldLabel}:</span>
              {chip.label}
              <button
                type="button"
                onClick={() => removeChip(chip.key, chip.value)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                aria-label={`Remove ${chip.fieldLabel} ${chip.label} filter`}
              >
                <XIcon className="size-2.5" />
              </button>
            </span>
          ))}
          {activeChips.length > 1 && (
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

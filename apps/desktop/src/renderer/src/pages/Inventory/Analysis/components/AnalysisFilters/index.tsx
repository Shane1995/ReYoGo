import { cn, DateRangePicker } from '@reyogo/ui';
import { SearchIcon, XIcon } from 'lucide-react';
import { FilterSelects } from './components/FilterSelects';
import { fieldBase, fieldLabel } from './constants';
import type { FiltersProps } from './types';

export function AnalysisFilters({
  search,
  filterType,
  filterCategory,
  fromDate,
  toDate,
  availableTypes,
  availableCategories,
  hasFilters,
  setSearch,
  setFilterType,
  setFilterCategory,
  setFromDate,
  setToDate,
  clearFilters,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2.5">
      <div className="flex flex-col">
        <label className={fieldLabel}>Search</label>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
          <input
            type="search"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(fieldBase, 'w-72 pl-8 placeholder:text-muted-foreground/40')}
          />
        </div>
      </div>
      <FilterSelects
        filterType={filterType}
        filterCategory={filterCategory}
        availableTypes={availableTypes}
        availableCategories={availableCategories}
        setFilterType={setFilterType}
        setFilterCategory={setFilterCategory}
      />
      <div className="h-6 w-px bg-border/60 self-end mb-1 hidden sm:block" />
      <div className="flex flex-col">
        <label className={fieldLabel}>Date range</label>
        <DateRangePicker
          from={fromDate}
          to={toDate}
          onChange={(f, t) => {
            setFromDate(f);
            setToDate(t);
          }}
        />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex items-center gap-1 self-end mb-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <XIcon className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}

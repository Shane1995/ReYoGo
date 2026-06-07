import type { Supplier } from '@reyogo/types';
import { DateRangePicker, cn } from '@reyogo/ui';
import { SearchIcon, XIcon } from 'lucide-react';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  supplierFilter: string;
  setSupplierFilter: (v: string) => void;
  suppliers: Supplier[];
  hasFilters: boolean;
  clearFilters: () => void;
};

const fieldLabel =
  'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block';
const selectBase =
  'h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 pr-7';

export function InvoiceFilterBar({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  supplierFilter,
  setSupplierFilter,
  suppliers,
  hasFilters,
  clearFilters,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by item name or invoice number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm',
            'font-[family-name:var(--font-mono,_DM_Mono,_monospace)] placeholder:font-sans placeholder:text-muted-foreground/40',
            'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 transition-shadow',
            search && 'border-[var(--primary)]/40',
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2.5">
        {suppliers.length > 0 && (
          <div className="flex flex-col">
            <label className={fieldLabel}>Supplier</label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className={cn(selectBase, 'w-44', !supplierFilter && 'text-muted-foreground/60')}
            >
              <option value="">All suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

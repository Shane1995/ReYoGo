import { cn, DateRangePicker, PageHeader } from '@reyogo/ui';
import { SearchIcon, XIcon } from 'lucide-react';
import { useAnalysisData } from './hooks/useAnalysisData';
import type { AnalysisTab } from './hooks/useAnalysisData';
import { SummaryTableView } from './components/SummaryTableView';
import { TableView } from './components/TableView';
import { ByCategoryView } from './components/ByCategoryView';
import { typeLabel } from './types';

const fieldBase =
  'h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50';

const TAB_LABELS: { key: AnalysisTab; label: string }[] = [
  { key: 'all', label: 'All items' },
  { key: 'by-type', label: 'By type' },
  { key: 'by-category', label: 'By category' },
];

const fieldLabel =
  'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block';
const selectClass = cn(fieldBase, 'pr-7');

export default function InventoryAnalysis() {
  const {
    lines,
    loading,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    analysisTab,
    setAnalysisTab,
    availableTypes,
    availableCategories,
    groups,
    hasFilters,
    clearFilters,
  } = useAnalysisData();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Cost Analysis">
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

          <div className="flex flex-col">
            <label className={fieldLabel}>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={cn(selectClass, 'w-36', !filterType && 'text-muted-foreground/60')}
            >
              <option value="">All types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className={fieldLabel}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={cn(selectClass, 'w-44', !filterCategory && 'text-muted-foreground/60')}
            >
              <option value="">All categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

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
      </PageHeader>

      <div className="shrink-0 border-b border-[var(--nav-border)] bg-background px-6">
        <div className="flex gap-0">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAnalysisTab(key)}
              className={cn(
                'px-4 py-2.5 text-sm border-b-2 transition-colors',
                analysisTab === key
                  ? 'border-[var(--nav-active-border)] text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground/60">Loading…</p>
        ) : lines.length === 0 ? (
          <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
            No captured invoices yet. Save invoices from Capture Invoice to see analysis here.
          </div>
        ) : analysisTab === 'all' ? (
          <TableView groups={groups} />
        ) : analysisTab === 'by-type' ? (
          <SummaryTableView groups={groups} />
        ) : (
          <ByCategoryView groups={groups} />
        )}
      </div>
    </div>
  );
}

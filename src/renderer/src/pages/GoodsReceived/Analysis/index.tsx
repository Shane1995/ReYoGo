import { cn } from "@/lib/utils";
import { useAnalysisData } from "./hooks/useAnalysisData";
import type { AnalysisTab } from "./hooks/useAnalysisData";
import { SummaryTableView } from "./SummaryTableView";
import { TableView } from "./TableView";
import { ByCategoryView } from "./ByCategoryView";
import { typeLabel } from "./types";

const inputClass =
  "h-8 rounded-md border border-input bg-muted px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

const selectClass =
  "h-8 rounded-md border border-input bg-muted px-2.5 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 text-muted-foreground";

const TAB_LABELS: { key: AnalysisTab; label: string }[] = [
  { key: "all", label: "All Items" },
  { key: "by-type", label: "By Good Type" },
  { key: "by-category", label: "By Category" },
];

export default function GoodsReceivedAnalysis() {
  const {
    lines,
    loading,
    fromDate, setFromDate,
    toDate, setToDate,
    search, setSearch,
    filterType, setFilterType,
    filterCategory, setFilterCategory,
    analysisTab, setAnalysisTab,
    availableTypes,
    availableCategories,
    groups,
    hasFilters,
    clearFilters,
  } = useAnalysisData();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border bg-background px-4 py-3 space-y-2">
        <input
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(inputClass, "w-full")}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={cn(selectClass, filterType && "text-foreground")}
          >
            <option value="">All Good Types</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>{typeLabel(t)}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={cn(selectClass, filterCategory && "text-foreground")}
          >
            <option value="">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-1.5 text-sm">
            <label className="text-muted-foreground shrink-0">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <label className="text-muted-foreground shrink-0">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 border-b border-border bg-background px-4">
        <div className="flex gap-0">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAnalysisTab(key)}
              className={cn(
                "px-4 py-2.5 text-sm border-b-2 transition-colors",
                analysisTab === key
                  ? "border-[var(--nav-active-border)] text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : lines.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 p-10 text-center text-muted-foreground">
            No captured invoices yet. Save invoices from Capture Invoice to see analysis here.
          </div>
        ) : analysisTab === "all" ? (
          <TableView groups={groups} />
        ) : analysisTab === "by-type" ? (
          <SummaryTableView groups={groups} />
        ) : (
          <ByCategoryView groups={groups} />
        )}
      </div>
    </div>
  );
}

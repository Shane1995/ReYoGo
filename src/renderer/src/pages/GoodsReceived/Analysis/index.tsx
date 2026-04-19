import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAnalysisData } from "./hooks/useAnalysisData";
import { segBtn } from "./utils/styles";
import { typeLabel } from "./types";
import { SummaryTableView } from "./SummaryTableView";
import { TableView } from "./TableView";
import { ChartView } from "./ChartView";
import { CategoriesView } from "./CategoriesView";
import { ItemDetail } from "./ItemDetail";

const inputClass =
  "h-7 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50";

export default function GoodsReceivedAnalysis() {
  const location = useLocation();
  const initialItemId = (location.state as { itemId?: string } | null)?.itemId ?? null;

  const {
    lines,
    loading,
    fromDate, setFromDate,
    toDate, setToDate,
    search, setSearch,
    activeType, setActiveType,
    view, setView,
    selectedItemId, setSelectedItemId,
    allGroups, availableTypes, groups, searchGroups,
  } = useAnalysisData(initialItemId);

  const tabs = ["all", ...availableTypes];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Cost per unit analysis</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track how the cost per unit of each item changes across captured invoices.
        </p>
      </header>

      <div className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, "w-44")}
          />
          <div className="flex items-center gap-1.5 text-sm">
            <label className="text-muted-foreground shrink-0">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <label className="text-muted-foreground shrink-0">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>
          {(fromDate || toDate) && (
            <button type="button" onClick={() => { setFromDate(""); setToDate(""); }}
              className="text-xs text-muted-foreground hover:text-foreground underline">
              Clear
            </button>
          )}
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-[var(--nav-border)] p-0.5">
            <button type="button" onClick={() => setView("table")} className={segBtn(view === "table")}>Table</button>
            <button type="button" onClick={() => setView("chart")} className={segBtn(view === "chart")}>Chart</button>
            <button type="button" onClick={() => setView("categories")} className={segBtn(view === "categories")}>Categories</button>
          </div>
        </div>
      </div>

      {!selectedItemId && availableTypes.length > 1 && view !== "categories" && (
        <div className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4">
          <div className="flex gap-0">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={cn(
                  "px-4 py-2.5 text-sm border-b-2 transition-colors",
                  activeType === t
                    ? "border-[var(--nav-active-border)] text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "all" ? "All" : typeLabel(t)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : lines.length === 0 ? (
          <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
            No captured invoices yet. Save invoices from Capture Invoice to see analysis here.
          </div>
        ) : selectedItemId ? (
          (() => {
            const group = allGroups.find((g) => g.itemId === selectedItemId) ?? null;
            if (!group) { setSelectedItemId(null); return null; }
            return <ItemDetail group={group} onBack={() => setSelectedItemId(null)} />;
          })()
        ) : view === "table" ? (
          activeType === "all"
            ? <SummaryTableView groups={groups} onSelect={setSelectedItemId} />
            : <TableView groups={groups} onSelect={setSelectedItemId} />
        ) : view === "chart" ? (
          <ChartView groups={groups} />
        ) : (
          <CategoriesView allGroups={searchGroups} />
        )}
      </div>
    </div>
  );
}

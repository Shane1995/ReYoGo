import { useEffect, useState } from "react";
import { stockMovementsService } from "@/services/stockMovements";
import type { ICOGSSummary } from "@shared/types/contract";

const inputClass =
  "h-8 rounded-md border border-input bg-muted px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

function fmt(n: number) {
  return n.toLocaleString("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 });
}

export default function CostingDashboard() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [cogs, setCogs] = useState<ICOGSSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    stockMovementsService.getCOGS(fromDate || undefined, toDate || undefined)
      .then(setCogs)
      .catch(() => setCogs(null))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Costing Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Cost of Goods Used (COGS) summary.</p>
      </header>

      <div className="shrink-0 border-b border-border bg-background px-4 py-3 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-sm">
          <label className="text-muted-foreground shrink-0">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <label className="text-muted-foreground shrink-0">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
        </div>
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={() => { setFromDate(""); setToDate(""); }}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total COGS</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
                {cogs ? fmt(cogs.total) : "—"}
              </p>
              {!cogs?.total && (
                <p className="mt-1 text-xs text-muted-foreground">
                  COGS populates when stock OUT movements are recorded.
                </p>
              )}
            </div>

            {cogs && cogs.byCategory.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      <th className="px-4 py-2.5 text-left">Category</th>
                      <th className="px-4 py-2.5 text-right">COGS</th>
                      <th className="px-4 py-2.5 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cogs.byCategory.map((row, i) => (
                      <tr key={row.categoryId ?? i} className={i % 2 === 1 ? "bg-white/[0.03]" : ""}>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.categoryName ?? "Uncategorised"}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">{fmt(row.total)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {cogs.total > 0 ? `${((row.total / cogs.total) * 100).toFixed(1)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

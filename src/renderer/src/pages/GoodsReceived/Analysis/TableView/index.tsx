import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";
import { InsightChips } from "../InsightChips";
import { fmt, fmtDate, fmtPct } from "../utils/format";
import { overallChangePct, groupStats } from "../utils/stats";
import { changeCls } from "../utils/styles";
import type { ItemGroup } from "../types";

export function TableView({ groups, onSelect }: { groups: ItemGroup[]; onSelect: (id: string) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const toggleCat = (key: string) =>
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-10 text-center text-muted-foreground">
        No data for the selected range or search.
      </div>
    );
  }

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const categoryMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    const key = g.categoryName ?? "";
    if (!categoryMap.has(key)) categoryMap.set(key, []);
    categoryMap.get(key)!.push(g);
  }
  const hasCategories = categoryMap.size > 1 || (categoryMap.size === 1 && !categoryMap.has(""));
  const categorySections = hasCategories
    ? Array.from(categoryMap.entries()).sort(([a], [b]) => a.localeCompare(b))
    : null;

  const allStats = groupStats(groups);

  const tableHead = (
    <thead>
      <tr className="border-b border-[var(--nav-border)] bg-muted/20 text-xs">
        <th className="w-8 py-2 px-2" />
        <th className="py-2 px-4 text-left font-medium text-muted-foreground">Item</th>
        <th className="py-2 px-4 text-left font-medium text-muted-foreground">Last captured</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Last unit price (excl. VAT)</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Overall change</th>
        <th />
      </tr>
    </thead>
  );

  const renderRows = (rowGroups: ItemGroup[]) =>
    rowGroups.map((group, gi) => {
      const last = group.entries[group.entries.length - 1];
      const change = overallChangePct(group);
      const isExpanded = expanded.has(group.itemId);
      return (
        <Fragment key={group.itemId}>
          <tr
            onClick={() => onSelect(group.itemId)}
            className={cn(
              "border-b border-[var(--nav-border)]/40 cursor-pointer hover:bg-[var(--nav-active-border)]/5 transition-colors",
              gi % 2 === 0 ? "bg-background" : "bg-muted/10"
            )}
          >
            <td className="py-2.5 px-3 text-center text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); toggleExpand(group.itemId); }}>
              <span className={cn("inline-block transition-transform text-xs", isExpanded && "rotate-90")}>▶</span>
            </td>
            <td className="py-2.5 px-4 font-medium text-foreground">{group.name}</td>
            <td className="py-2.5 px-4 text-muted-foreground">{fmtDate(last.date)}</td>
            <td className="py-2.5 px-4 text-right font-mono font-medium text-foreground">
              {fmt(last.unitPrice)}{last.uom ? ` / ${last.uom}` : ""}
            </td>
            <td className={cn("py-2.5 px-4 text-right", changeCls(change, true))}>
              {change === null ? "—" : fmtPct(change)}
            </td>
            <td className="py-2.5 px-2 text-muted-foreground/40 text-xs">→</td>
          </tr>
          {isExpanded && (
            <tr className="border-b border-[var(--nav-border)]">
              <td />
              <td colSpan={4} className="px-4 py-3 bg-muted/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="pb-1.5 text-left font-medium">Date</th>
                      <th className="pb-1.5 text-right font-medium">Qty</th>
                      <th className="pb-1.5 text-right font-medium">UoM</th>
                      <th className="pb-1.5 text-right font-medium">Unit price (excl. VAT)</th>
                      <th className="pb-1.5 text-right font-medium">vs Previous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry, ei) => {
                      const prev = ei > 0 ? group.entries[ei - 1] : null;
                      const pct = prev && prev.unitPrice > 0
                        ? ((entry.unitPrice - prev.unitPrice) / prev.unitPrice) * 100 : null;
                      return (
                        <tr key={`${entry.invoiceId}-${ei}`} className="border-t border-[var(--nav-border)]/30">
                          <td className="py-1.5 text-muted-foreground">{fmtDate(entry.date)}</td>
                          <td className="py-1.5 text-right font-mono">{entry.quantity}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{entry.uom ?? "—"}</td>
                          <td className="py-1.5 text-right font-mono font-medium">{fmt(entry.unitPrice)}</td>
                          <td className={cn("py-1.5 text-right", changeCls(pct))}>
                            {pct === null ? "—" : fmtPct(pct)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </Fragment>
      );
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <InsightChips stats={allStats} />
      </div>

      <div className="rounded-xl border border-[var(--nav-border)] overflow-hidden">
        <table className="w-full text-sm">
          {tableHead}
          <tbody>
            {categorySections ? (
              categorySections.map(([catName, catGroups]) => {
                const catStats = groupStats(catGroups);
                const isCollapsed = !expandedCats.has(catName);
                return (
                  <Fragment key={catName}>
                    <tr className="border-b border-[var(--nav-border)]/60 cursor-pointer select-none hover:bg-muted/10"
                      onClick={() => toggleCat(catName)}>
                      <td colSpan={6} className="relative py-0">
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-[var(--nav-active-border)]/60" />
                        <div className="flex items-center justify-between pl-5 pr-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className={cn("inline-block transition-transform text-xs text-muted-foreground/50", !isCollapsed && "rotate-90")}>▶</span>
                            <span className="inline-flex items-center rounded-md border border-[var(--nav-active-border)]/40 bg-[var(--nav-active-border)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--nav-active-border)]">
                              {catName || "Uncategorised"}
                            </span>
                          </div>
                          <InsightChips stats={catStats} />
                        </div>
                      </td>
                    </tr>
                    {!isCollapsed && renderRows(catGroups)}
                  </Fragment>
                );
              })
            ) : (
              renderRows(groups)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

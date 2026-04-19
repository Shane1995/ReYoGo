import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";
import { InsightChips } from "../InsightChips";
import { fmt, fmtDate, fmtPct } from "../utils/format";
import { overallChangePct, groupStats } from "../utils/stats";
import { changeCls } from "../utils/styles";
import { TYPE_ORDER, typeLabel } from "../types";
import type { ItemGroup } from "../types";

export function SummaryTableView({ groups, onSelect }: { groups: ItemGroup[]; onSelect: (id: string) => void }) {
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

  const sectionMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    if (!sectionMap.has(g.categoryType)) sectionMap.set(g.categoryType, []);
    sectionMap.get(g.categoryType)!.push(g);
  }
  const sections = [
    ...TYPE_ORDER.filter((t) => sectionMap.has(t)).map((t) => ({ type: t, groups: sectionMap.get(t)! })),
    ...Array.from(sectionMap.entries()).filter(([t]) => !TYPE_ORDER.includes(t)).map(([t, gs]) => ({ type: t, groups: gs })),
  ];

  const renderItemRows = (catGroups: ItemGroup[]) =>
    catGroups.map((group, gi) => {
      const last = group.entries[group.entries.length - 1];
      const change = overallChangePct(group);
      const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
      const avgPrice = group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;
      return (
        <tr
          key={group.itemId}
          onClick={() => onSelect(group.itemId)}
          className={cn(
            "border-b border-[var(--nav-border)]/40 cursor-pointer hover:bg-[var(--nav-active-border)]/5 transition-colors",
            gi % 2 === 0 ? "bg-background" : "bg-muted/10"
          )}
        >
          <td className="py-2.5 px-4 font-medium text-foreground">{group.name}</td>
          <td className="py-2.5 px-4 text-center tabular-nums text-muted-foreground">{group.entries.length}</td>
          <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">{fmt(minPrice)}</td>
          <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">{fmt(avgPrice)}</td>
          <td className="py-2.5 px-4 text-right text-muted-foreground">{fmtDate(last.date)}</td>
          <td className="py-2.5 px-4 text-right font-mono font-medium text-foreground">
            {fmt(last.unitPrice)}{last.uom ? ` / ${last.uom}` : ""}
          </td>
          <td className={cn("py-2.5 px-4 text-right", changeCls(change, true))}>
            {change === null ? "—" : fmtPct(change)}
          </td>
          <td className="py-2.5 px-2 text-muted-foreground/40 text-xs">→</td>
        </tr>
      );
    });

  const tableHead = (
    <thead>
      <tr className="border-b border-[var(--nav-border)] bg-muted/20 text-xs">
        <th className="py-2 px-4 text-left font-medium text-muted-foreground">Item</th>
        <th className="py-2 px-4 text-center font-medium text-muted-foreground">Entries</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Min</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Avg</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Last captured</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Last price (excl. VAT)</th>
        <th className="py-2 px-4 text-right font-medium text-muted-foreground">Overall change</th>
        <th />
      </tr>
    </thead>
  );

  return (
    <div className="space-y-5">
      {sections.map((section) => {
        const catMap = new Map<string, ItemGroup[]>();
        for (const g of section.groups) {
          const key = g.categoryName ?? "";
          if (!catMap.has(key)) catMap.set(key, []);
          catMap.get(key)!.push(g);
        }
        const hasSubCategories = catMap.size > 1 || (catMap.size === 1 && !catMap.has(""));
        const catSections = hasSubCategories
          ? Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b))
          : null;
        const typeStats = groupStats(section.groups);

        return (
          <div key={section.type} className="rounded-xl border border-[var(--nav-border)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-[var(--nav-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                {typeLabel(section.type)}
              </span>
              <InsightChips stats={typeStats} />
            </div>

            {catSections ? (
              <table className="w-full text-sm">
                {tableHead}
                <tbody>
                  {catSections.map(([catName, catGroups]) => {
                    const catStats = groupStats(catGroups);
                    const isCollapsed = !expandedCats.has(catName);
                    return (
                      <Fragment key={catName}>
                        <tr className="border-b border-[var(--nav-border)]/60 cursor-pointer select-none hover:bg-muted/10"
                          onClick={() => toggleCat(catName)}>
                          <td colSpan={8} className="relative py-0">
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
                        {!isCollapsed && renderItemRows(catGroups)}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                {tableHead}
                <tbody>{renderItemRows(section.groups)}</tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

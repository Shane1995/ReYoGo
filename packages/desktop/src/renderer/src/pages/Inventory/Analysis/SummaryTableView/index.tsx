import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InsightChips } from "../InsightChips";
import { fmt, fmtDate, fmtPct } from "../utils/format";
import { overallChangePct, groupStats } from "../utils/stats";
import { changeCls } from "../utils/styles";
import { TYPE_ORDER, typeLabel } from "../types";
import { itemTrendPath } from "@/components/AppRoutes/routePaths";
import type { ItemGroup } from "../types";

export function SummaryTableView({ groups }: { groups: ItemGroup[] }) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleCat = (key: string) =>
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
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

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Item</TableHead>
            <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-foreground/80">Entries</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Min</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Avg</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Last Captured</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Last Price (excl. VAT)</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Overall Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => {
            const catMap = new Map<string, ItemGroup[]>();
            for (const g of section.groups) {
              const key = g.categoryName ?? "";
              if (!catMap.has(key)) catMap.set(key, []);
              catMap.get(key)!.push(g);
            }
            const catSections = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));
            const typeStats = groupStats(section.groups);

            return (
              <Fragment key={section.type}>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={7} className="py-2.5 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">
                        {typeLabel(section.type)}
                      </span>
                      <InsightChips stats={typeStats} />
                    </div>
                  </TableCell>
                </TableRow>

                {catSections.map(([catName, catGroups], ci) => {
                  const catStats = groupStats(catGroups);
                  const isExpanded = expandedCats.has(catName);
                  return (
                    <Fragment key={catName}>
                      <TableRow
                        className={cn("cursor-pointer select-none hover:bg-white/[0.08]", ci % 2 === 1 ? "bg-white/[0.06]" : "bg-muted/10")}
                        onClick={() => toggleCat(catName)}
                      >
                        <TableCell colSpan={7} className="relative py-0">
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-border" />
                          <div className="flex items-center justify-between pl-6 pr-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className={cn("inline-block text-xs text-muted-foreground/50 transition-transform", isExpanded && "rotate-90")}>▶</span>
                              <span className="text-sm font-medium text-foreground/70">{catName || "Uncategorised"}</span>
                            </div>
                            <InsightChips stats={catStats} />
                          </div>
                        </TableCell>
                      </TableRow>

                      {isExpanded && catGroups.map((group, gi) => {
                        const last = group.entries[group.entries.length - 1];
                        const change = overallChangePct(group);
                        const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
                        const avgPrice = group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;
                        return (
                          <TableRow key={group.itemId} className={cn("cursor-pointer hover:bg-white/[0.08]", gi % 2 === 1 ? "bg-white/[0.06]" : "")} onClick={() => navigate(itemTrendPath(group.itemId))}>
                            <TableCell className="py-3 pl-10 font-medium text-foreground hover:underline">{group.name}</TableCell>
                            <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{group.entries.length}</TableCell>
                            <TableCell className="py-3 text-right font-mono text-muted-foreground">{fmt(minPrice)}</TableCell>
                            <TableCell className="py-3 text-right font-mono text-muted-foreground">{fmt(avgPrice)}</TableCell>
                            <TableCell className="py-3 text-right text-muted-foreground">{fmtDate(last.date)}</TableCell>
                            <TableCell className="py-3 text-right font-mono font-medium text-foreground">
                              {fmt(last.unitPrice)}{last.uom ? ` / ${last.uom}` : ""}
                            </TableCell>
                            <TableCell className={cn("py-3 text-right", changeCls(change, true))}>
                              {change === null ? "—" : fmtPct(change)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

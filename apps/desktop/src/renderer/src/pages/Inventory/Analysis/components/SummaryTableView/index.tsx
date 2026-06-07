import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableRow } from '@reyogo/ui';
import { InsightChips } from '../InsightChips';
import { groupStats } from '../../utils/stats';
import { TYPE_ORDER, typeLabel } from '../../types';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { AnalysisTableHeader } from '../shared/AnalysisTableHeader';
import { AnalysisCategoryRow } from '../shared/AnalysisCategoryRow';
import { AnalysisItemRow } from '../shared/AnalysisItemRow';
import type { ItemGroup } from '../../types';

export function SummaryTableView({ groups }: { groups: ItemGroup[] }) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleCat = (key: string) =>
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
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
    ...TYPE_ORDER.filter((t) => sectionMap.has(t)).map((t) => ({
      type: t,
      groups: sectionMap.get(t)!,
    })),
    ...Array.from(sectionMap.entries())
      .filter(([t]) => !TYPE_ORDER.includes(t))
      .map(([t, gs]) => ({ type: t, groups: gs })),
  ];

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <AnalysisTableHeader />
        <TableBody>
          {sections.map((section) => {
            const catMap = new Map<string, ItemGroup[]>();
            for (const g of section.groups) {
              const key = g.categoryName ?? '';
              if (!catMap.has(key)) catMap.set(key, []);
              catMap.get(key)!.push(g);
            }
            const catSections = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));
            const typeStats = groupStats(section.groups);

            return (
              <Fragment key={section.type}>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-[var(--nav-border)]">
                  <TableCell colSpan={7} className="py-2 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        {typeLabel(section.type)}
                      </span>
                      <InsightChips stats={typeStats} />
                    </div>
                  </TableCell>
                </TableRow>

                {catSections.map(([catName, catGroups]) => (
                  <Fragment key={catName}>
                    <AnalysisCategoryRow
                      catName={catName}
                      catGroups={catGroups}
                      isExpanded={expandedCats.has(catName)}
                      onToggle={() => toggleCat(catName)}
                    />
                    {expandedCats.has(catName) &&
                      catGroups.map((group, gi) => (
                        <AnalysisItemRow
                          key={group.itemId}
                          group={group}
                          rowIndex={gi}
                          onNavigate={(id) => navigate(itemTrendPath(id))}
                        />
                      ))}
                  </Fragment>
                ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

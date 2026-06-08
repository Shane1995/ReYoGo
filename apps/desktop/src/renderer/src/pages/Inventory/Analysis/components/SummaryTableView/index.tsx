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

type Section = { type: string; groups: ItemGroup[] };

function buildSections(groups: ItemGroup[]): Section[] {
  const sectionMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    if (!sectionMap.has(g.categoryType)) sectionMap.set(g.categoryType, []);
    sectionMap.get(g.categoryType)!.push(g);
  }
  return [
    ...TYPE_ORDER.filter((t) => sectionMap.has(t)).map((t) => ({
      type: t,
      groups: sectionMap.get(t)!,
    })),
    ...Array.from(sectionMap.entries())
      .filter(([t]) => !TYPE_ORDER.includes(t))
      .map(([t, gs]) => ({ type: t, groups: gs })),
  ];
}

function TypeSectionRows({
  section,
  expandedCats,
  onToggleCat,
  onNavigate,
}: {
  section: Section;
  expandedCats: Set<string>;
  onToggleCat: (key: string) => void;
  onNavigate: (id: string) => void;
}) {
  const catMap = new Map<string, ItemGroup[]>();
  for (const g of section.groups) {
    const key = g.categoryName ?? '';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(g);
  }
  const catSections = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  return (
    <Fragment key={section.type}>
      <TableRow className="bg-muted/40 hover:bg-muted/40 border-[var(--nav-border)]">
        <TableCell colSpan={7} className="py-2 px-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {typeLabel(section.type)}
            </span>
            <InsightChips stats={groupStats(section.groups)} />
          </div>
        </TableCell>
      </TableRow>
      {catSections.map(([catName, catGroups]) => (
        <Fragment key={catName}>
          <AnalysisCategoryRow
            catName={catName}
            catGroups={catGroups}
            isExpanded={expandedCats.has(catName)}
            onToggle={() => onToggleCat(catName)}
          />
          {expandedCats.has(catName) &&
            catGroups.map((group, gi) => (
              <AnalysisItemRow
                key={group.itemId}
                group={group}
                rowIndex={gi}
                onNavigate={onNavigate}
              />
            ))}
        </Fragment>
      ))}
    </Fragment>
  );
}

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

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <AnalysisTableHeader />
        <TableBody>
          {buildSections(groups).map((section) => (
            <TypeSectionRows
              key={section.type}
              section={section}
              expandedCats={expandedCats}
              onToggleCat={toggleCat}
              onNavigate={(id) => navigate(itemTrendPath(id))}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

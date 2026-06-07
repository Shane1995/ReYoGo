import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody } from '@reyogo/ui';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { AnalysisTableHeader } from '../shared/AnalysisTableHeader';
import { AnalysisCategoryRow } from '../shared/AnalysisCategoryRow';
import { AnalysisItemRow } from '../shared/AnalysisItemRow';
import type { ItemGroup } from '../../types';

export function ByCategoryView({ groups }: { groups: ItemGroup[] }) {
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

  const catMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    const key = g.categoryName ?? '';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(g);
  }
  const catSections = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <AnalysisTableHeader />
        <TableBody>
          {catSections.map(([catName, catGroups]) => (
            <Fragment key={catName}>
              <AnalysisCategoryRow
                catName={catName}
                catGroups={catGroups}
                isExpanded={expandedCats.has(catName)}
                onToggle={() => toggleCat(catName)}
              />
              {expandedCats.has(catName) &&
                catGroups.map((group) => (
                  <AnalysisItemRow
                    key={group.itemId}
                    group={group}
                    onNavigate={(id) => navigate(itemTrendPath(id))}
                  />
                ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

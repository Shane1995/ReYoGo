import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody } from '@reyogo/ui';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { AnalysisTableHeader } from '../shared/AnalysisTableHeader';
import { AnalysisCategoryRow } from '../shared/AnalysisCategoryRow';
import { AnalysisItemRow } from '../shared/AnalysisItemRow';
import { toggleSetMember } from '../../utils/toggleSetMember';
import { groupByCategoryName } from '../../utils/groupByCategoryName';
import type { ByCategoryViewProps } from './types';

export function ByCategoryView({ groups }: ByCategoryViewProps) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleCat = (key: string) => setExpandedCats((prev) => toggleSetMember(prev, key));

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No data for the selected range or search.
      </div>
    );
  }

  const catSections = groupByCategoryName(groups);

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

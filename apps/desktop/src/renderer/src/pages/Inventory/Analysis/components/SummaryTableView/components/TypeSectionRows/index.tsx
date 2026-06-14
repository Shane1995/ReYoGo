import { Fragment } from 'react';
import { TableCell, TableRow } from '@reyogo/ui';
import { InsightChips } from '../../../InsightChips';
import { groupStats } from '../../../../utils/stats';
import { typeLabel } from '../../../../utils/typeLabel';
import { groupByCategoryName } from '../../../../utils/groupByCategoryName';
import { AnalysisCategoryRow } from '../../../shared/AnalysisCategoryRow';
import { AnalysisItemRow } from '../../../shared/AnalysisItemRow';
import type { TypeSectionRowsProps } from './types';

export function TypeSectionRows({
  section,
  expandedCats,
  onToggleCat,
  onNavigate,
}: TypeSectionRowsProps) {
  const catSections = groupByCategoryName(section.groups);
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

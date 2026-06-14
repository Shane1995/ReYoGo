import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody } from '@reyogo/ui';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { AnalysisTableHeader } from '../shared/AnalysisTableHeader';
import { toggleSetMember } from '../../utils/toggleSetMember';
import { buildSections } from './utils/buildSections';
import { TypeSectionRows } from './components/TypeSectionRows';
import type { SummaryTableViewProps } from './types';

export function SummaryTableView({ groups }: SummaryTableViewProps) {
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

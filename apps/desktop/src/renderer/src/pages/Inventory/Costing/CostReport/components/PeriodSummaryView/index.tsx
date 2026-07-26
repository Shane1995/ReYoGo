import { useState } from 'react';
import { cn } from '@reyogo/ui';
import { usePeriodSummaryData } from './hooks/usePeriodSummaryData';
import { filteredCogsOf } from './utils/filteredCogsOf';
import { CogsTotalCard } from '../../../Dashboard/components/CogsTotalCard';
import { CogsCategoryTable } from '../../../Dashboard/components/CogsCategoryTable';
import { fieldLabel, selectClass } from '../../../../Analysis/components/AnalysisFilters/constants';
import type { PeriodSummaryViewProps } from './types';

export function PeriodSummaryView({ fromDate, toDate, entityId }: PeriodSummaryViewProps) {
  const { loading, cogs } = usePeriodSummaryData(fromDate, toDate, entityId);
  const [filterCategory, setFilterCategory] = useState('');

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }
  if (!cogs) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No cost of goods data for the selected range.
      </div>
    );
  }

  const availableCategories = cogs.byCategory
    .map((row) => row.categoryName)
    .filter((name): name is string => name !== null)
    .sort();
  const filteredCogs = filteredCogsOf(cogs, filterCategory);

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label className={fieldLabel}>Category</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={cn(selectClass, 'w-48', !filterCategory && 'text-muted-foreground/60')}
        >
          <option value="">All categories</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <CogsTotalCard cogs={filteredCogs} />
      <CogsCategoryTable cogs={filteredCogs} />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { usePeriodSummaryData } from './hooks/usePeriodSummaryData';
import { filteredCogsOrNull } from './utils/filteredCogsOrNull';
import { availableCategoriesOf } from './utils/availableCategoriesOf';
import { CogsTotalCard } from '@/pages/Inventory/Costing/Dashboard/components/CogsTotalCard';
import { CogsCategoryTable } from '@/pages/Inventory/Costing/Dashboard/components/CogsCategoryTable';
import { CategoryFilter } from '../CategoryFilter';
import type { PeriodSummaryViewProps } from './types';

export function PeriodSummaryView({
  fromDate,
  toDate,
  entityId,
  onCogsChange,
}: PeriodSummaryViewProps) {
  const { loading, cogs } = usePeriodSummaryData(fromDate, toDate, entityId);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredCogs = useMemo(
    () => filteredCogsOrNull(cogs, selectedCategories),
    [cogs, selectedCategories],
  );

  useEffect(() => {
    onCogsChange(filteredCogs);
  }, [filteredCogs, onCogsChange]);

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }
  if (!cogs || !filteredCogs) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No cost of goods data for the selected range.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CategoryFilter
        selected={selectedCategories}
        options={availableCategoriesOf(cogs)}
        onChange={setSelectedCategories}
      />
      <CogsTotalCard cogs={filteredCogs} />
      <CogsCategoryTable cogs={filteredCogs} />
    </div>
  );
}

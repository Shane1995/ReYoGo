import { useEffect, useMemo } from 'react';
import { usePeriodSummaryData } from './hooks/usePeriodSummaryData';
import { filteredCogsOrNull } from './utils/filteredCogsOrNull';
import { filteredCogsOfType } from './utils/filteredCogsOfType';
import { availableCategoriesOf } from './utils/availableCategoriesOf';
import { availableTypesOfCogs } from './utils/availableTypesOfCogs';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useAvailableOptionsSync } from '../../hooks/useAvailableOptionsSync';
import { CogsTotalCard } from '@/pages/Inventory/Costing/Dashboard/components/CogsTotalCard';
import { CogsCategoryTable } from '@/pages/Inventory/Costing/Dashboard/components/CogsCategoryTable';
import type { PeriodSummaryViewProps } from './types';

export function PeriodSummaryView({
  fromDate,
  toDate,
  entityId,
  selectedCategories,
  selectedType,
  onCogsChange,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: PeriodSummaryViewProps) {
  const { loading, cogs } = usePeriodSummaryData(fromDate, toDate, entityId);
  const { categories } = useInventory();

  const availableCategories = useMemo(() => (cogs ? availableCategoriesOf(cogs) : []), [cogs]);
  const availableTypes = useMemo(
    () => (cogs ? availableTypesOfCogs(cogs, categories) : []),
    [cogs, categories],
  );

  const filteredCogs = useMemo(() => {
    const byCategory = filteredCogsOrNull(cogs, selectedCategories);
    if (!byCategory) return null;
    return filteredCogsOfType(byCategory, categories, selectedType);
  }, [cogs, categories, selectedCategories, selectedType]);

  useEffect(() => {
    onCogsChange(filteredCogs);
  }, [filteredCogs, onCogsChange]);

  useAvailableOptionsSync({
    availableCategories,
    availableTypes,
    onAvailableCategoriesChange,
    onAvailableTypesChange,
  });

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
      <CogsTotalCard cogs={filteredCogs} />
      <CogsCategoryTable cogs={filteredCogs} />
    </div>
  );
}

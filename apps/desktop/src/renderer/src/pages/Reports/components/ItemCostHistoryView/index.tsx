import { useEffect, useMemo } from 'react';
import { useAvailableOptionsSync } from '../../hooks/useAvailableOptionsSync';
import { useItemCostHistoryData } from './hooks/useItemCostHistoryData';
import { itemCostHistoryRowsOf } from './utils/itemCostHistoryRowsOf';
import { ItemCostHistoryTable } from './components/ItemCostHistoryTable';
import type { ItemCostHistoryViewProps } from './types';

export function ItemCostHistoryView({
  fromDate,
  toDate,
  entityId,
  selectedCategories,
  selectedType,
  onRowsChange,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: ItemCostHistoryViewProps) {
  const { loading, groups, availableCategories, availableTypes } = useItemCostHistoryData(
    fromDate,
    toDate,
    entityId,
    selectedCategories,
    selectedType,
  );

  const rows = useMemo(() => (loading ? [] : itemCostHistoryRowsOf(groups)), [loading, groups]);

  useEffect(() => {
    onRowsChange(rows);
  }, [rows, onRowsChange]);

  useAvailableOptionsSync({
    availableCategories,
    availableTypes,
    onAvailableCategoriesChange,
    onAvailableTypesChange,
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }

  return (
    <div className="space-y-3">
      <ItemCostHistoryTable rows={rows} />
    </div>
  );
}

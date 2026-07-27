import { useEffect, useMemo } from 'react';
import { useItemCostHistoryData } from './hooks/useItemCostHistoryData';
import { itemCostHistoryRowsOf } from './utils/itemCostHistoryRowsOf';
import { ItemCostHistoryTable } from './components/ItemCostHistoryTable';
import { CategoryFilter } from '../CategoryFilter';
import type { ItemCostHistoryViewProps } from './types';

export function ItemCostHistoryView({
  fromDate,
  toDate,
  entityId,
  onRowsChange,
}: ItemCostHistoryViewProps) {
  const { loading, groups, selectedCategories, setSelectedCategories, availableCategories } =
    useItemCostHistoryData(fromDate, toDate, entityId);

  const rows = useMemo(() => (loading ? [] : itemCostHistoryRowsOf(groups)), [loading, groups]);

  useEffect(() => {
    onRowsChange(rows);
  }, [rows, onRowsChange]);

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }

  return (
    <div className="space-y-3">
      <CategoryFilter
        selected={selectedCategories}
        options={availableCategories}
        onChange={setSelectedCategories}
      />
      <ItemCostHistoryTable rows={rows} />
    </div>
  );
}

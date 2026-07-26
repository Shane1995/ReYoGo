import { useEffect, useMemo } from 'react';
import { cn } from '@reyogo/ui';
import { useItemCostHistoryData } from './hooks/useItemCostHistoryData';
import { itemCostHistoryRowsOf } from './utils/itemCostHistoryRowsOf';
import { ItemCostHistoryTable } from './components/ItemCostHistoryTable';
import {
  fieldLabel,
  selectClass,
} from '@/pages/Inventory/Analysis/components/AnalysisFilters/constants';
import type { ItemCostHistoryViewProps } from './types';

export function ItemCostHistoryView({
  fromDate,
  toDate,
  entityId,
  onRowsChange,
}: ItemCostHistoryViewProps) {
  const { loading, groups, filterCategory, setFilterCategory, availableCategories } =
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
      <ItemCostHistoryTable rows={rows} />
    </div>
  );
}

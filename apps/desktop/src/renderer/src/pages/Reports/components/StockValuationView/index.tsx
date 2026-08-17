import { useEffect, useMemo, useState } from 'react';
import { useStockLevelRows } from '../../hooks/useStockLevelRows';
import { grandTotalOf } from '../../hooks/useStockLevelRows/utils/grandTotalOf';
import { sortStockRows } from '../../hooks/useStockLevelRows/utils/sortStockRows';
import { StockCostSource, StockSortKey } from '../../hooks/useStockLevelRows/types';
import { useAvailableOptionsSync } from '../../hooks/useAvailableOptionsSync';
import { StockSortSelect } from '../StockSortSelect';
import { StockValuationTable } from './components/StockValuationTable';
import type { StockValuationViewProps } from './types';

export function StockValuationView({
  entityId,
  asOfDate,
  selectedCategories,
  selectedType,
  onRowsChange,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: StockValuationViewProps) {
  const { loading, rows, availableCategories, availableTypes } = useStockLevelRows(
    entityId,
    asOfDate,
    selectedCategories,
    selectedType,
    StockCostSource.LastCost,
  );
  const [sortBy, setSortBy] = useState<StockSortKey>(StockSortKey.Name);

  const sortedRows = useMemo(() => sortStockRows(rows, sortBy), [rows, sortBy]);

  useEffect(() => {
    onRowsChange(sortedRows);
  }, [sortedRows, onRowsChange]);

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
      <div className="flex items-end gap-4">
        <StockSortSelect value={sortBy} onChange={setSortBy} />
      </div>
      <StockValuationTable rows={sortedRows} grandTotal={grandTotalOf(sortedRows)} />
    </div>
  );
}

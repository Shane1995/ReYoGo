import { useEffect, useMemo, useState } from 'react';
import { useStockLevelRows } from '../../hooks/useStockLevelRows';
import { grandTotalOf } from '../../hooks/useStockLevelRows/utils/grandTotalOf';
import { sortStockRows } from '../../hooks/useStockLevelRows/utils/sortStockRows';
import { StockSortKey } from '../../hooks/useStockLevelRows/types';
import { useAvailableOptionsSync } from '../../hooks/useAvailableOptionsSync';
import { StockSortSelect } from '../StockSortSelect';
import { StockOnHandTable } from './components/StockOnHandTable';
import type { StockOnHandViewProps } from './types';

export function StockOnHandView({
  entityId,
  asOfDate,
  selectedCategories,
  selectedType,
  onRowsChange,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: StockOnHandViewProps) {
  const { loading, rows, availableCategories, availableTypes } = useStockLevelRows(
    entityId,
    asOfDate,
    selectedCategories,
    selectedType,
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
    <div className="space-y-3 print:space-y-2">
      <div className="flex items-end gap-4 print:hidden">
        <StockSortSelect value={sortBy} onChange={setSortBy} />
      </div>
      <StockOnHandTable rows={sortedRows} grandTotal={grandTotalOf(sortedRows)} />
    </div>
  );
}

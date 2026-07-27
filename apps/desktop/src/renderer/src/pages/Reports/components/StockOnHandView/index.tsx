import { useEffect, useMemo, useState } from 'react';
import { useStockLevelRows } from '../../hooks/useStockLevelRows';
import { grandTotalOf } from '../../hooks/useStockLevelRows/utils/grandTotalOf';
import { sortStockRows } from './utils/sortStockRows';
import { CategoryFilter } from '../CategoryFilter';
import { SortSelect } from './components/SortSelect';
import { StockOnHandTable } from './components/StockOnHandTable';
import { StockOnHandSortKey } from './types';
import type { StockOnHandViewProps } from './types';

export function StockOnHandView({ entityId, asOfDate, onRowsChange }: StockOnHandViewProps) {
  const { loading, rows, availableCategories, selectedCategories, setSelectedCategories } =
    useStockLevelRows(entityId, asOfDate);
  const [sortBy, setSortBy] = useState<StockOnHandSortKey>(StockOnHandSortKey.Name);

  const sortedRows = useMemo(() => sortStockRows(rows, sortBy), [rows, sortBy]);

  useEffect(() => {
    onRowsChange(sortedRows);
  }, [sortedRows, onRowsChange]);

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }

  return (
    <div className="space-y-3 print:space-y-2">
      <div className="flex items-end gap-4 print:hidden">
        <CategoryFilter
          selected={selectedCategories}
          options={availableCategories}
          onChange={setSelectedCategories}
        />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>
      <StockOnHandTable rows={sortedRows} grandTotal={grandTotalOf(sortedRows)} />
    </div>
  );
}

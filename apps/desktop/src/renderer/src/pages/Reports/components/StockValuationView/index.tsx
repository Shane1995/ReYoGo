import { useEffect } from 'react';
import { useStockLevelRows } from '../../hooks/useStockLevelRows';
import { grandTotalOf } from '../../hooks/useStockLevelRows/utils/grandTotalOf';
import { CategoryFilter } from '../CategoryFilter';
import { StockValuationTable } from './components/StockValuationTable';
import type { StockValuationViewProps } from './types';

export function StockValuationView({ entityId, asOfDate, onRowsChange }: StockValuationViewProps) {
  const { loading, rows, availableCategories, selectedCategories, setSelectedCategories } =
    useStockLevelRows(entityId, asOfDate);

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
      <StockValuationTable rows={rows} grandTotal={grandTotalOf(rows)} />
    </div>
  );
}

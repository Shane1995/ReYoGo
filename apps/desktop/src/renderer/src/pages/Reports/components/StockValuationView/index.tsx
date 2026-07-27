import { useEffect } from 'react';
import { useStockLevelRows } from '../../hooks/useStockLevelRows';
import { grandTotalOf } from '../../hooks/useStockLevelRows/utils/grandTotalOf';
import { StockValuationTable } from './components/StockValuationTable';
import type { StockValuationViewProps } from './types';

export function StockValuationView({ entityId, onRowsChange }: StockValuationViewProps) {
  const { loading, rows } = useStockLevelRows(entityId);

  useEffect(() => {
    onRowsChange(rows);
  }, [rows, onRowsChange]);

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }

  return <StockValuationTable rows={rows} grandTotal={grandTotalOf(rows)} />;
}

import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

export type StockValuationTableProps = {
  rows: StockLevelRow[];
  grandTotal: number;
};

import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

export type StockOnHandTableProps = {
  rows: StockLevelRow[];
  grandTotal: number;
};

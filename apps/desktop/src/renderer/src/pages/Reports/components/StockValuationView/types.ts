import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export type StockValuationViewProps = {
  entityId: string | undefined;
  asOfDate: string;
  onRowsChange: (rows: StockLevelRow[]) => void;
};

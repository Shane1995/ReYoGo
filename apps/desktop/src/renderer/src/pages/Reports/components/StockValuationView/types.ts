import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export type StockValuationViewProps = {
  entityId: string | undefined;
  onRowsChange: (rows: StockLevelRow[]) => void;
};

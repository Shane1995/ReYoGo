import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export type StockOnHandViewProps = {
  entityId: string | undefined;
  asOfDate: string;
  onRowsChange: (rows: StockLevelRow[]) => void;
};

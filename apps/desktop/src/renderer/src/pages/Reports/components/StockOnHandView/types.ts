import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export enum StockOnHandSortKey {
  Name = 'name',
  Quantity = 'quantity',
  TotalValue = 'totalValue',
}

export type StockOnHandViewProps = {
  entityId: string | undefined;
  onRowsChange: (rows: StockLevelRow[]) => void;
};

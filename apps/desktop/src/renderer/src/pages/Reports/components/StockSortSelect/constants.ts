import { StockSortKey } from '../../hooks/useStockLevelRows/types';

export const SORT_OPTIONS: Array<{ key: StockSortKey; label: string }> = [
  { key: StockSortKey.Name, label: 'Name' },
  { key: StockSortKey.Quantity, label: 'Quantity' },
  { key: StockSortKey.TotalValue, label: 'Total value' },
];

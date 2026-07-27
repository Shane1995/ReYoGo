import { StockOnHandSortKey } from './types';

export const SORT_OPTIONS: Array<{ key: StockOnHandSortKey; label: string }> = [
  { key: StockOnHandSortKey.Name, label: 'Name' },
  { key: StockOnHandSortKey.Quantity, label: 'Quantity' },
  { key: StockOnHandSortKey.TotalValue, label: 'Total value' },
];

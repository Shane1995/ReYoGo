import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';
import { StockOnHandSortKey } from '../../types';

function compareByName(a: StockLevelRow, b: StockLevelRow): number {
  return a.itemName.localeCompare(b.itemName);
}

function compareByQuantity(a: StockLevelRow, b: StockLevelRow): number {
  return b.quantity - a.quantity;
}

function compareByTotalValue(a: StockLevelRow, b: StockLevelRow): number {
  return b.totalValue - a.totalValue;
}

const COMPARATORS: Record<StockOnHandSortKey, (a: StockLevelRow, b: StockLevelRow) => number> = {
  [StockOnHandSortKey.Name]: compareByName,
  [StockOnHandSortKey.Quantity]: compareByQuantity,
  [StockOnHandSortKey.TotalValue]: compareByTotalValue,
};

export function sortStockRows(rows: StockLevelRow[], sortBy: StockOnHandSortKey): StockLevelRow[] {
  return [...rows].sort(COMPARATORS[sortBy]);
}

import { StockSortKey } from '../../types';
import type { StockLevelRow } from '../../types';

function compareByName(a: StockLevelRow, b: StockLevelRow): number {
  return a.itemName.localeCompare(b.itemName);
}

function compareByQuantity(a: StockLevelRow, b: StockLevelRow): number {
  return b.quantity - a.quantity;
}

function compareByTotalValue(a: StockLevelRow, b: StockLevelRow): number {
  return b.totalValue - a.totalValue;
}

const COMPARATORS: Record<StockSortKey, (a: StockLevelRow, b: StockLevelRow) => number> = {
  [StockSortKey.Name]: compareByName,
  [StockSortKey.Quantity]: compareByQuantity,
  [StockSortKey.TotalValue]: compareByTotalValue,
};

export function sortStockRows(rows: StockLevelRow[], sortBy: StockSortKey): StockLevelRow[] {
  return [...rows].sort(COMPARATORS[sortBy]);
}

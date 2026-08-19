import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';
import { grandTotalOf } from '../../../../hooks/useStockLevelRows/utils/grandTotalOf';
import { roundTo } from '../roundTo';
import { groupSheetRowsByCategory } from '../groupSheetRowsByCategory';

const HEADER = ['Item', 'Unit', 'Qty', 'Avg Cost', 'Total Value'];

function rowOf(row: StockLevelRow): (string | number)[] {
  return [
    row.itemName,
    row.uom ?? '',
    row.quantity,
    roundTo(row.avgCost, 2),
    roundTo(row.totalValue, 2),
  ];
}

export function buildStockOnHandSheetRows(rows: StockLevelRow[]): (string | number)[][] {
  const totalRow = ['', '', '', 'Grand Total', roundTo(grandTotalOf(rows), 2)];
  return [HEADER, ...groupSheetRowsByCategory(rows, (row) => row.categoryName, rowOf), totalRow];
}

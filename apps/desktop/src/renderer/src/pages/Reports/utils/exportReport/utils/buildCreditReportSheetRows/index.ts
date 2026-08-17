import { groupSheetRowsByCategory } from '../groupSheetRowsByCategory';
import { grandItemTotalOf } from '../../../grandItemTotalOf';
import { roundTo } from '../roundTo';
import type { ItemTotalRow } from '../../../itemTotalRowsOf/types';

const HEADER = ['Item', 'Category', 'Unit', 'Qty', 'Total Value'];

function rowOf(row: ItemTotalRow): (string | number)[] {
  return [row.itemName, row.uom ?? '', row.qty, roundTo(row.totalValue, 2)];
}

export function buildCreditReportSheetRows(rows: ItemTotalRow[]): (string | number)[][] {
  const totalRow = ['', '', '', 'Grand Total', roundTo(grandItemTotalOf(rows), 2)];
  return [HEADER, ...groupSheetRowsByCategory(rows, (row) => row.categoryName, rowOf), totalRow];
}

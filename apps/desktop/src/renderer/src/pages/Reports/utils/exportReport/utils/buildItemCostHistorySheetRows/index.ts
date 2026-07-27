import type { ItemCostHistoryRow } from '../../../../components/ItemCostHistoryView/types';
import { roundTo } from '../roundTo';

const HEADER = ['Item', 'UOM', 'Date', 'Qty', 'Excl. VAT', 'Incl. VAT', 'Taxable', '% Change'];

function dateOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function rowOf(row: ItemCostHistoryRow): (string | number)[] {
  return [
    row.itemName,
    row.uom ?? '',
    dateOf(row.date),
    row.quantity,
    roundTo(row.unitCostExclVat, 2),
    roundTo(row.unitCostInclVat, 2),
    row.isVatable ? 'Yes' : 'No',
    row.pctChange === null ? '' : roundTo(row.pctChange, 1),
  ];
}

export function buildItemCostHistorySheetRows(rows: ItemCostHistoryRow[]): (string | number)[][] {
  return [HEADER, ...rows.map(rowOf)];
}

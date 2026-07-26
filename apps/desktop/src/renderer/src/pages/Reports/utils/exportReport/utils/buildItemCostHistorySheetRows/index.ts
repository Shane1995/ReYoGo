import type { ItemCostHistoryRow } from '../../../../components/ItemCostHistoryView/types';

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
    row.unitCostExclVat,
    row.unitCostInclVat,
    row.isVatable ? 'Yes' : 'No',
    row.pctChange === null ? '' : row.pctChange,
  ];
}

export function buildItemCostHistorySheetRows(rows: ItemCostHistoryRow[]): (string | number)[][] {
  return [HEADER, ...rows.map(rowOf)];
}

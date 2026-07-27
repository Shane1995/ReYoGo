import { describe, it, expect } from 'vitest';
import { buildItemCostHistorySheetRows } from '.';
import type { ItemCostHistoryRow } from '../../../../components/ItemCostHistoryView/types';

const row: ItemCostHistoryRow = {
  itemId: 'item-1',
  itemName: 'Flour',
  uom: 'kg',
  invoiceId: 'inv-1',
  date: new Date('2026-01-15'),
  quantity: 2,
  unitCostExclVat: 10,
  unitCostInclVat: 11.5,
  isVatable: true,
  pctChange: 12.5,
  flagged: true,
};

describe('buildItemCostHistorySheetRows', () => {
  it('emits a header row followed by one row per entry', () => {
    const sheet = buildItemCostHistorySheetRows([row]);
    expect(sheet[0]).toEqual([
      'Item',
      'UOM',
      'Date',
      'Qty',
      'Excl. VAT',
      'Incl. VAT',
      'Taxable',
      '% Change',
    ]);
    expect(sheet[1]).toEqual(['Flour', 'kg', '2026-01-15', 2, 10, 11.5, 'Yes', 12.5]);
  });

  it('renders a null pctChange as an empty string and isVatable false as "No"', () => {
    const sheet = buildItemCostHistorySheetRows([{ ...row, isVatable: false, pctChange: null }]);
    expect(sheet[1]).toEqual(['Flour', 'kg', '2026-01-15', 2, 10, 11.5, 'No', '']);
  });

  it('returns just the header row for an empty input', () => {
    const sheet = buildItemCostHistorySheetRows([]);
    expect(sheet).toHaveLength(1);
  });

  it('rounds long decimal costs to 2 places and pctChange to 1 place', () => {
    const sheet = buildItemCostHistorySheetRows([
      {
        ...row,
        unitCostExclVat: 10.365942029,
        unitCostInclVat: 11.920833333,
        pctChange: 0.000000012345,
      },
    ]);
    expect(sheet[1]).toEqual(['Flour', 'kg', '2026-01-15', 2, 10.37, 11.92, 'Yes', 0]);
  });
});

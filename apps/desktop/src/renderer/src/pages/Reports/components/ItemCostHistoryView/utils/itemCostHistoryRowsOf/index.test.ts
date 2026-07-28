import { describe, it, expect } from 'vitest';
import { itemCostHistoryRowsOf } from '.';
import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

function group(overrides: Partial<ItemGroup> = {}): ItemGroup {
  return {
    itemId: 'item-1',
    name: 'Flour',
    uom: 'kg',
    categoryType: 'food',
    categoryName: 'Dry Goods',
    entries: [],
    ...overrides,
  };
}

describe('itemCostHistoryRowsOf', () => {
  it('emits one row per entry, carrying item name and uom', () => {
    const groups = [
      group({
        entries: [
          {
            invoiceId: 'inv-1',
            date: new Date('2026-01-01'),
            quantity: 2,
            unitPrice: 10,
            unitPriceInclVat: 11.5,
            isVatable: true,
          },
        ],
      }),
    ];
    const rows = itemCostHistoryRowsOf(groups);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      itemId: 'item-1',
      itemName: 'Flour',
      uom: 'kg',
      categoryName: 'Dry Goods',
      quantity: 2,
      unitCostExclVat: 10,
      unitCostInclVat: 11.5,
      isVatable: true,
      pctChange: null,
      flagged: false,
    });
  });

  it('computes pctChange against the previous entry for the same item', () => {
    const groups = [
      group({
        entries: [
          {
            invoiceId: 'inv-1',
            date: new Date('2026-01-01'),
            quantity: 1,
            unitPrice: 10,
            unitPriceInclVat: 10,
            isVatable: false,
          },
          {
            invoiceId: 'inv-2',
            date: new Date('2026-02-01'),
            quantity: 1,
            unitPrice: 11,
            unitPriceInclVat: 11,
            isVatable: false,
          },
        ],
      }),
    ];
    const rows = itemCostHistoryRowsOf(groups);
    expect(rows[0]!.pctChange).toBeNull();
    expect(rows[1]!.pctChange).toBeCloseTo(10);
  });

  it('flags a row whose absolute pctChange exceeds the threshold', () => {
    const groups = [
      group({
        entries: [
          {
            invoiceId: 'inv-1',
            date: new Date('2026-01-01'),
            quantity: 1,
            unitPrice: 10,
            unitPriceInclVat: 10,
            isVatable: false,
          },
          {
            invoiceId: 'inv-2',
            date: new Date('2026-02-01'),
            quantity: 1,
            unitPrice: 12,
            unitPriceInclVat: 12,
            isVatable: false,
          },
        ],
      }),
    ];
    const rows = itemCostHistoryRowsOf(groups);
    expect(rows[1]!.pctChange).toBeCloseTo(20);
    expect(rows[1]!.flagged).toBe(true);
  });

  it('does not flag a row at or below the threshold', () => {
    const groups = [
      group({
        entries: [
          {
            invoiceId: 'inv-1',
            date: new Date('2026-01-01'),
            quantity: 1,
            unitPrice: 10,
            unitPriceInclVat: 10,
            isVatable: false,
          },
          {
            invoiceId: 'inv-2',
            date: new Date('2026-02-01'),
            quantity: 1,
            unitPrice: 11,
            unitPriceInclVat: 11,
            isVatable: false,
          },
        ],
      }),
    ];
    const rows = itemCostHistoryRowsOf(groups);
    expect(rows[1]!.pctChange).toBeCloseTo(10);
    expect(rows[1]!.flagged).toBe(false);
  });
});

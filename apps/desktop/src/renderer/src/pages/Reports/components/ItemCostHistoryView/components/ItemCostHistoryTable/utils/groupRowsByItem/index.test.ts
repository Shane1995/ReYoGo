import { describe, it, expect } from 'vitest';
import { groupRowsByItem } from '.';
import type { ItemCostHistoryRow } from '../../../../types';

function row(overrides: Partial<ItemCostHistoryRow> = {}): ItemCostHistoryRow {
  return {
    itemId: 'item-1',
    itemName: 'Flour',
    uom: 'kg',
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 1,
    unitCostExclVat: 10,
    unitCostInclVat: 10,
    isVatable: false,
    pctChange: null,
    flagged: false,
    ...overrides,
  };
}

describe('groupRowsByItem', () => {
  it('groups consecutive rows sharing an itemId', () => {
    const rows = [
      row({ invoiceId: 'inv-1' }),
      row({ invoiceId: 'inv-2' }),
      row({ itemId: 'item-2', itemName: 'Milk', invoiceId: 'inv-3' }),
    ];
    const groups = groupRowsByItem(rows);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.itemId).toBe('item-1');
    expect(groups[0]!.rows).toHaveLength(2);
    expect(groups[1]!.itemId).toBe('item-2');
    expect(groups[1]!.rows).toHaveLength(1);
  });

  it('carries itemName and uom from the group', () => {
    const groups = groupRowsByItem([row({ itemName: 'Flour', uom: 'kg' })]);
    expect(groups[0]).toMatchObject({ itemName: 'Flour', uom: 'kg' });
  });

  it('flags the group when any of its rows is flagged', () => {
    const rows = [row({ flagged: false }), row({ invoiceId: 'inv-2', flagged: true })];
    const groups = groupRowsByItem(rows);
    expect(groups[0]!.flagged).toBe(true);
  });

  it('does not flag the group when none of its rows is flagged', () => {
    const groups = groupRowsByItem([row({ flagged: false })]);
    expect(groups[0]!.flagged).toBe(false);
  });

  it('returns an empty array for no rows', () => {
    expect(groupRowsByItem([])).toEqual([]);
  });
});

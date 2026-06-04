import { describe, it, expect } from 'vitest';
import { buildItemGroups } from './buildItemGroups';
import type { InvoiceLineWithDate } from '@reyogo/types';

function makeLine(overrides: Partial<InvoiceLineWithDate> = {}): InvoiceLineWithDate {
  return {
    id: 'l1',
    invoiceId: 'inv1',
    inventoryItemId: 'item-1',
    qty: 2,
    unitCost: 10,
    totalCost: 20,
    invoiceDate: new Date('2025-01-01'),
    categoryType: 'food',
    categoryName: 'Food',
    vatRate: 15,
    isVatable: true,
    ...overrides,
  };
}

describe('buildItemGroups', () => {
  it('populates unitPriceInclVat as unitCost * (1 + vatRate/100) for vatable lines', () => {
    const groups = buildItemGroups([makeLine()], '', '', [{ id: 'item-1', name: 'Flour' }]);
    expect(groups[0]!.entries[0]!.unitPriceInclVat).toBeCloseTo(11.5);
  });

  it('sets unitPriceInclVat equal to unitCost when isVatable is false', () => {
    const groups = buildItemGroups([makeLine({ isVatable: false })], '', '', [
      { id: 'item-1', name: 'Flour' },
    ]);
    expect(groups[0]!.entries[0]!.unitPriceInclVat).toBeCloseTo(10);
  });

  it('skips lines with qty <= 0', () => {
    const groups = buildItemGroups([makeLine({ qty: 0 })], '', '', []);
    expect(groups).toHaveLength(0);
  });

  it('filters by date range', () => {
    const groups = buildItemGroups(
      [makeLine({ invoiceDate: new Date('2025-01-01') })],
      '2025-02-01',
      '2025-03-01',
      [],
    );
    expect(groups).toHaveLength(0);
  });
});

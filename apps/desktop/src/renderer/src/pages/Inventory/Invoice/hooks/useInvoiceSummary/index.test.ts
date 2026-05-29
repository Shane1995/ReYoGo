import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInvoiceSummary } from './index';
import { InventoryType } from '@reyogo/types';
import type { Category, InventoryItem } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';

function makeLine(overrides: Partial<ProcessReceiptLine> = {}): ProcessReceiptLine {
  return {
    id: 'l1',
    itemId: 'item-1',
    quantity: 2,
    isVatable: true,
    totalVatExclude: 100,
    ...overrides,
  };
}

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Food',
  type: InventoryType.Food,
};

const mockItem: InventoryItem = {
  id: 'item-1',
  entityId: 'entity-1',
  name: 'Chicken',
  categoryId: 'cat-1',
  unitOfMeasureId: null,
  sku: null,
  currentStockQty: 10,
  currentWeightedAvgCost: 5,
  reorderPoint: null,
  reorderQty: null,
};

describe('useInvoiceSummary', () => {
  describe('itemsWithCategory', () => {
    it('attaches category name and type label to each item', () => {
      const { result } = renderHook(() =>
        useInvoiceSummary([makeLine()], [mockItem], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.itemsWithCategory[0]!.categoryName).toBe('Food');
      expect(result.current.itemsWithCategory[0]!.typeLabel).toBe(InventoryType.Food);
    });

    it('uses empty strings when category is not found', () => {
      const itemNoCat: InventoryItem = { ...mockItem, id: 'item-2', categoryId: 'unknown-cat' };
      const { result } = renderHook(() =>
        useInvoiceSummary([makeLine()], [itemNoCat], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.itemsWithCategory[0]!.categoryName).toBe('');
      expect(result.current.itemsWithCategory[0]!.typeLabel).toBe('');
    });
  });

  describe('itemMetaMap', () => {
    it('indexes items by id', () => {
      const { result } = renderHook(() =>
        useInvoiceSummary([makeLine()], [mockItem], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.itemMetaMap.get('item-1')?.name).toBe('Chicken');
    });
  });

  describe('invoiceSummary', () => {
    it('computes subtotal, vat, and grandTotal for exclusive vatable lines', () => {
      const line = makeLine({ quantity: 2, isVatable: true, totalVatExclude: 100 });
      const { result } = renderHook(() =>
        useInvoiceSummary([line], [mockItem], [mockCategory], 'exclusive', 15),
      );
      const { subtotal, totalVat, grandTotal, lineCount } = result.current.invoiceSummary;
      expect(subtotal).toBeCloseTo(100);
      expect(totalVat).toBeCloseTo(15);
      expect(grandTotal).toBeCloseTo(115);
      expect(lineCount).toBe(1);
    });

    it('produces zero VAT for non-vatable lines', () => {
      const line = makeLine({ isVatable: false, totalVatExclude: 100 });
      const { result } = renderHook(() =>
        useInvoiceSummary([line], [mockItem], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.invoiceSummary.totalVat).toBe(0);
      expect(result.current.invoiceSummary.subtotal).toBeCloseTo(100);
    });

    it('does not count lines with no itemId toward lineCount', () => {
      const line = makeLine({ itemId: '' });
      const { result } = renderHook(() => useInvoiceSummary([line], [], [], 'exclusive', 15));
      expect(result.current.invoiceSummary.lineCount).toBe(0);
    });

    it('sums multiple lines', () => {
      const lines = [
        makeLine({ id: 'l1', itemId: 'item-1', totalVatExclude: 100 }),
        makeLine({ id: 'l2', itemId: 'item-1', totalVatExclude: 200 }),
      ];
      const { result } = renderHook(() =>
        useInvoiceSummary(lines, [mockItem], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.invoiceSummary.subtotal).toBeCloseTo(300);
    });
  });

  describe('validLines', () => {
    it('includes lines with itemId and qty > 0', () => {
      const line = makeLine({ itemId: 'item-1', quantity: 1, totalVatExclude: 50 });
      const { result } = renderHook(() =>
        useInvoiceSummary([line], [mockItem], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.validLines).toHaveLength(1);
    });

    it('excludes lines with no itemId', () => {
      const line = makeLine({ itemId: '', quantity: 2 });
      const { result } = renderHook(() => useInvoiceSummary([line], [], [], 'exclusive', 15));
      expect(result.current.validLines).toHaveLength(0);
    });

    it('excludes lines with qty 0', () => {
      const line = makeLine({ itemId: 'item-1', quantity: 0 });
      const { result } = renderHook(() =>
        useInvoiceSummary([line], [mockItem], [mockCategory], 'exclusive', 15),
      );
      expect(result.current.validLines).toHaveLength(0);
    });
  });
});

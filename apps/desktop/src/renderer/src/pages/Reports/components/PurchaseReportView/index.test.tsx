import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const useInventory = vi.fn();
const getPurchaseTotalsByItem = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getPurchaseTotalsByItem: (...args: unknown[]) => getPurchaseTotalsByItem(...args),
  },
}));

import { PurchaseReportView } from '.';

beforeEach(() => {
  useInventory.mockReset();
  getPurchaseTotalsByItem.mockReset();
  useInventory.mockReturnValue({
    items: [{ id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' }],
    categories: [{ id: 'cat-1', name: 'Dairy', type: 'food' }],
  });
  getPurchaseTotalsByItem.mockResolvedValue({ 'item-1': { qty: 10, totalValue: 40 } });
});

describe('PurchaseReportView', () => {
  it('renders the purchased item once loaded', async () => {
    render(
      <PurchaseReportView
        fromDate=""
        toDate=""
        entityId={undefined}
        selectedCategories={[]}
        selectedType=""
        onRowsChange={vi.fn()}
        onAvailableCategoriesChange={vi.fn()}
        onAvailableTypesChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText('Milk')).toBeDefined());
  });

  it('calls onRowsChange with the built rows', async () => {
    const onRowsChange = vi.fn();
    render(
      <PurchaseReportView
        fromDate=""
        toDate=""
        entityId={undefined}
        selectedCategories={[]}
        selectedType=""
        onRowsChange={onRowsChange}
        onAvailableCategoriesChange={vi.fn()}
        onAvailableTypesChange={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(onRowsChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ itemId: 'item-1' })]),
      ),
    );
  });
});

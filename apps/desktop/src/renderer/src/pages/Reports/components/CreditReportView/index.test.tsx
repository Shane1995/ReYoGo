import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const useInventory = vi.fn();
const getCreditTotalsByItem = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getCreditTotalsByItem: (...args: unknown[]) => getCreditTotalsByItem(...args),
  },
}));

import { CreditReportView } from '.';

beforeEach(() => {
  useInventory.mockReset();
  getCreditTotalsByItem.mockReset();
  useInventory.mockReturnValue({
    items: [{ id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' }],
    categories: [{ id: 'cat-1', name: 'Dairy', type: 'food' }],
  });
  getCreditTotalsByItem.mockResolvedValue({ 'item-1': { qty: 2, totalValue: 8 } });
});

describe('CreditReportView', () => {
  it('renders the credited item once loaded', async () => {
    render(
      <CreditReportView
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
      <CreditReportView
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

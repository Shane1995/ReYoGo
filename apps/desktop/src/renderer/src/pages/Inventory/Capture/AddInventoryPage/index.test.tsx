import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddInventoryPage from '.';

vi.mock('../CapturedInventory/Context/InventoryContext', () => ({
  useInventory: vi.fn(),
}));

import { useInventory } from '../CapturedInventory/Context/InventoryContext';

const mockUseInventory = {
  categories: [],
  items: [],
  units: [],
  addItem: vi.fn(),
  addCategory: vi.fn(),
};

beforeEach(() => {
  vi.mocked(useInventory).mockReturnValue(mockUseInventory as never);
});

describe('AddInventoryPage — dupe detection', () => {
  it('does not flag duplicate names across different items', () => {
    vi.mocked(useInventory).mockReturnValue({
      ...mockUseInventory,
      items: [
        {
          id: 'i1',
          name: 'Chips',
          categoryId: 'cat-1',
          unitOfMeasureId: null,
          sku: null,
          currentStockQty: 0,
          currentWeightedAvgCost: null,
          reorderPoint: null,
          reorderQty: null,
        },
      ],
    } as never);

    render(<AddInventoryPage />);
    expect(screen.queryByText('Already exists')).not.toBeInTheDocument();
  });
});

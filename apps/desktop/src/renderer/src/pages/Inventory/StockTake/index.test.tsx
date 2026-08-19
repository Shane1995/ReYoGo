import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const useInventory = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getLastUnitPrices: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/stocktake', () => ({
  stocktakeService: {
    createSession: vi.fn(),
    getSessions: vi.fn().mockResolvedValue([]),
    getSession: vi.fn(),
    saveDraftLines: vi.fn().mockResolvedValue(undefined),
    completeSession: vi.fn().mockResolvedValue(undefined),
  },
}));

import StockTakePage from '.';
import { stocktakeService } from '@/services/stocktake';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(stocktakeService.getSessions).mockResolvedValue([]);
  useInventory.mockReturnValue({
    items: [{ id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' }],
    categories: [{ id: 'cat-1', name: 'Dairy', type: 'food' }],
  });
});

describe('StockTakePage', () => {
  it('prompts to create a stock sheet when there is no current session', async () => {
    render(<StockTakePage />);
    await waitFor(() =>
      expect(screen.getByText('Create a stock sheet to start counting.')).toBeDefined(),
    );
  });

  it('shows the count sheet once a session is created', async () => {
    vi.mocked(stocktakeService.createSession).mockResolvedValue({
      id: 's1',
      accountId: 'default',
      label: null,
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
    });
    vi.mocked(stocktakeService.getSession).mockResolvedValue({
      id: 's1',
      accountId: 'default',
      label: null,
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
      lines: [],
    });

    render(<StockTakePage />);
    await waitFor(() =>
      expect(screen.getByText('Create a stock sheet to start counting.')).toBeDefined(),
    );

    fireEvent.click(screen.getByRole('button', { name: /New Stock Sheet/i }));

    await waitFor(() => expect(screen.getByText('Milk')).toBeDefined());
  });
});

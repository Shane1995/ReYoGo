import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => ({
    items: [],
    categories: [],
    unitOptions: [],
    addCategory: vi.fn(),
    addItem: vi.fn().mockReturnValue('new-item-id'),
  }),
}));

vi.mock('@/Context/EntityContext', () => ({
  useEntities: () => ({
    entities: [{ id: 'e1', name: 'Venue', defaultVatRate: 15 }],
    selectedEntityId: 'e1',
  }),
}));

vi.mock('@/services/invoice', () => ({
  invoiceService: { getLastUnitPrices: vi.fn().mockResolvedValue({}) },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: null, pathname: '/invoices', key: 'default' }),
  useNavigate: () => vi.fn(),
}));

vi.mock('../useDraftPersistence', () => ({
  loadDraft: () => null,
  useDraftPersistence: () => ({ clearDraft: vi.fn() }),
}));

vi.mock('../useLineManager', () => ({
  useLineManager: (lines: unknown[]) => ({
    lines,
    setLines: vi.fn(),
    addLine: vi.fn(),
    removeLine: vi.fn(),
    updateLine: vi.fn(),
  }),
}));

vi.mock('../useInvoiceSummary', () => ({
  useInvoiceSummary: () => ({
    invoiceSummary: {},
    validLines: [],
    itemsWithCategory: [],
    itemMetaMap: new Map(),
  }),
}));

describe('useInvoiceForm', () => {
  it('reads entityId from global entity context', async () => {
    const { useInvoiceForm } = await import('./index');
    const { result } = renderHook(() => useInvoiceForm());
    expect(result.current.entityId).toBe('e1');
  });

  it('addItem injects current entityId into item before forwarding to context', async () => {
    const mockAddItem = vi.fn().mockReturnValue('new-id');
    vi.resetModules();
    vi.doMock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
      useInventory: () => ({
        items: [],
        categories: [],
        unitOptions: [],
        addCategory: vi.fn(),
        addItem: mockAddItem,
      }),
    }));
    vi.doMock('@/Context/EntityContext', () => ({
      useEntities: () => ({
        entities: [{ id: 'e1', name: 'Venue', defaultVatRate: 15 }],
        selectedEntityId: 'e1',
      }),
    }));
    vi.doMock('@/services/invoice', () => ({
      invoiceService: { getLastUnitPrices: vi.fn().mockResolvedValue({}) },
    }));
    vi.doMock('react-router-dom', () => ({
      useLocation: () => ({ state: null, pathname: '/invoices', key: 'default' }),
      useNavigate: () => vi.fn(),
    }));
    vi.doMock('../useDraftPersistence', () => ({
      loadDraft: () => null,
      useDraftPersistence: () => ({ clearDraft: vi.fn() }),
    }));
    vi.doMock('../useLineManager', () => ({
      useLineManager: (lines: unknown[]) => ({
        lines,
        setLines: vi.fn(),
        addLine: vi.fn(),
        removeLine: vi.fn(),
        updateLine: vi.fn(),
      }),
    }));
    vi.doMock('../useInvoiceSummary', () => ({
      useInvoiceSummary: () => ({
        invoiceSummary: {},
        validLines: [],
        itemsWithCategory: [],
        itemMetaMap: new Map(),
      }),
    }));

    const { useInvoiceForm } = await import('./index');
    const { result } = renderHook(() => useInvoiceForm());

    act(() => {
      result.current.addItem({
        name: 'Chicken',
        categoryId: 'c1',
        type: 'Food',
        unitOfMeasureId: null,
      });
    });

    expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'e1' }));
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import type { IEntity } from '@reyogo/types';
import AddInventoryPage from '.';

const entity1: IEntity = {
  id: 'e1',
  groupId: 'g1',
  name: 'The Crown Pub',
  defaultVatRate: 15,
  defaultVatMode: VatMode.Exclusive,
  archivedAt: null,
};
const entity2: IEntity = {
  id: 'e2',
  groupId: 'g1',
  name: 'The Garden Bar',
  defaultVatRate: 15,
  defaultVatMode: VatMode.Exclusive,
  archivedAt: null,
};

vi.mock('@/Context/EntityContext', () => ({
  useEntities: vi.fn(),
}));

vi.mock('../CapturedInventory/Context/InventoryContext', () => ({
  useInventory: vi.fn(),
}));

import { useEntities } from '@/Context/EntityContext';
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

describe('AddInventoryPage — venue gating (multi-entity)', () => {
  it('disables the table when no venue is selected', () => {
    vi.mocked(useEntities).mockReturnValue({
      entities: [entity1, entity2],
      group: { id: 'g1', name: 'Group' },
      refetchEntities: vi.fn(),
    });

    render(<AddInventoryPage />);

    const table = screen.getByRole('table');
    const wrapper = table.closest('[class*="rounded-lg"]') as HTMLElement;
    expect(wrapper.className).toMatch(/pointer-events-none/);
    expect(wrapper.className).toMatch(/opacity-40/);
  });

  it('does not disable the table when a venue is selected', async () => {
    vi.mocked(useEntities).mockReturnValue({
      entities: [entity1],
      group: { id: 'g1', name: 'Group' },
      refetchEntities: vi.fn(),
    });

    render(<AddInventoryPage />);

    const table = screen.getByRole('table');
    const wrapper = table.closest('[class*="rounded-lg"]') as HTMLElement;
    expect(wrapper.className).not.toMatch(/pointer-events-none/);
    expect(wrapper.className).not.toMatch(/opacity-40/);
  });

  it('shows the venue selector only when multiple entities exist', () => {
    vi.mocked(useEntities).mockReturnValue({
      entities: [entity1, entity2],
      group: { id: 'g1', name: 'Group' },
      refetchEntities: vi.fn(),
    });

    render(<AddInventoryPage />);
    expect(screen.getByText('Adding items to')).toBeInTheDocument();
  });

  it('does not show the venue selector for a single entity', () => {
    vi.mocked(useEntities).mockReturnValue({
      entities: [entity1],
      group: { id: 'g1', name: 'Group' },
      refetchEntities: vi.fn(),
    });

    render(<AddInventoryPage />);
    expect(screen.queryByText('Adding items to')).not.toBeInTheDocument();
  });
});

describe('AddInventoryPage — dupe detection', () => {
  it('does not flag duplicate names across different venues', () => {
    vi.mocked(useEntities).mockReturnValue({
      entities: [entity1, entity2],
      group: { id: 'g1', name: 'Group' },
      refetchEntities: vi.fn(),
    });
    vi.mocked(useInventory).mockReturnValue({
      ...mockUseInventory,
      items: [
        {
          id: 'i1',
          entityId: 'e1',
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

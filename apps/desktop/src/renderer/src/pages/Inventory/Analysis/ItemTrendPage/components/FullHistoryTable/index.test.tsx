import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FullHistoryTable } from '.';
import { MovementType } from '@reyogo/types';

const movements = [
  {
    id: 'm1',
    inventoryItemId: 'item-1',
    movementType: MovementType.In,
    qty: 10,
    unitCostAtTime: 5,
    totalCost: 50,
    weightedAvgCostAfter: 5,
    stockQtyAfter: 10,
    referenceType: null,
    referenceId: null,
    notes: null,
    occurredAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    referenceLabel: 'INV-001',
  },
  {
    id: 'm2',
    inventoryItemId: 'item-1',
    movementType: MovementType.Return,
    qty: -2,
    unitCostAtTime: null,
    totalCost: null,
    weightedAvgCostAfter: 5,
    stockQtyAfter: 8,
    referenceType: null,
    referenceId: null,
    notes: null,
    occurredAt: new Date('2026-01-05'),
    createdAt: new Date('2026-01-05'),
    referenceLabel: 'CN-INV-001',
  },
];

describe('FullHistoryTable', () => {
  it('renders one row per movement with its reference label', () => {
    render(<FullHistoryTable movements={movements} />);
    expect(screen.getByText('INV-001')).toBeDefined();
    expect(screen.getByText('CN-INV-001')).toBeDefined();
  });

  it('shows the movement type for each row', () => {
    render(<FullHistoryTable movements={movements} />);
    expect(screen.getByText('IN')).toBeDefined();
    expect(screen.getByText('RETURN')).toBeDefined();
  });

  it('shows an empty state when there are no movements', () => {
    render(<FullHistoryTable movements={[]} />);
    expect(screen.getByText('No movements recorded')).toBeDefined();
  });
});

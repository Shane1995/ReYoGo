import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryTabs } from '.';
import { MovementType } from '@reyogo/types';

const entries = [
  {
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 10,
    unitPrice: 5,
    unitPriceInclVat: 5.75,
    isVatable: true,
    uom: 'L',
  },
];

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
];

describe('HistoryTabs', () => {
  it('shows the price trend table by default', () => {
    render(<HistoryTabs entries={entries} movements={movements} />);
    expect(screen.getByText('Unit price (excl. VAT)')).toBeDefined();
  });

  it('switches to the full history table when clicked', () => {
    render(<HistoryTabs entries={entries} movements={movements} />);
    fireEvent.click(screen.getByRole('button', { name: 'Full History' }));
    expect(screen.getByText('Reference')).toBeDefined();
  });
});

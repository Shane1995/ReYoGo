import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountSheetTable } from '.';

const buckets = [
  {
    category: 'Beverages',
    rows: [{ itemId: 'item-2', itemName: 'Coke', uom: 'L', lastCost: 2, countedQty: null }],
  },
  {
    category: 'Dairy',
    rows: [{ itemId: 'item-1', itemName: 'Milk', uom: 'L', lastCost: 4.5, countedQty: 10 }],
  },
];

describe('CountSheetTable', () => {
  it('renders a heading and rows for each category', () => {
    render(<CountSheetTable buckets={buckets} readOnly={false} onQtyChange={vi.fn()} />);
    expect(screen.getByText('Beverages')).toBeDefined();
    expect(screen.getByText('Dairy')).toBeDefined();
    expect(screen.getByText('Coke')).toBeDefined();
    expect(screen.getByText('Milk')).toBeDefined();
  });

  it('shows an empty state when there are no buckets', () => {
    render(<CountSheetTable buckets={[]} readOnly={false} onQtyChange={vi.fn()} />);
    expect(screen.getByText('No items to count')).toBeDefined();
  });
});

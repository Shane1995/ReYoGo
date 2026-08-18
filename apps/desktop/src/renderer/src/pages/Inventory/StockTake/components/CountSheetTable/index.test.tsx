import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountSheetTable } from '.';

const buckets = [
  {
    category: 'Beverages',
    rows: [
      {
        itemId: 'item-2',
        itemName: 'Coke',
        uom: 'L',
        lastCost: 2,
        countedQty: null,
        lineValue: null,
      },
    ],
  },
  {
    category: 'Dairy',
    rows: [
      {
        itemId: 'item-1',
        itemName: 'Milk',
        uom: 'L',
        lastCost: 4.5,
        countedQty: 10,
        lineValue: 45,
      },
    ],
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

  it('shows how many items are counted per category', () => {
    render(<CountSheetTable buckets={buckets} readOnly={false} onQtyChange={vi.fn()} />);
    expect(screen.getByText('0 / 1 counted')).toBeDefined();
    expect(screen.getByText('1 / 1 counted')).toBeDefined();
  });

  it('shows the running value counted per category', () => {
    render(<CountSheetTable buckets={buckets} readOnly={false} onQtyChange={vi.fn()} />);
    expect(screen.getAllByText('R 45,00').length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no buckets', () => {
    render(<CountSheetTable buckets={[]} readOnly={false} onQtyChange={vi.fn()} />);
    expect(screen.getByText('No items to count')).toBeDefined();
  });
});

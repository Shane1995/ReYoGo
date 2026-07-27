import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockOnHandTable } from '.';
import type { StockLevelRow } from '../../../../hooks/useStockLevelRows/types';

const rows: StockLevelRow[] = [
  {
    itemId: 'item-1',
    itemName: 'Milk',
    uom: 'L',
    categoryName: 'Dairy',
    categoryType: 'food',
    quantity: 10,
    avgCost: 2,
    totalValue: 20,
  },
];

describe('StockOnHandTable', () => {
  it('shows an empty state when there are no rows', () => {
    render(<StockOnHandTable rows={[]} grandTotal={0} />);
    expect(screen.getByText('No items match the selected categories.')).toBeInTheDocument();
  });

  it('renders the category column', () => {
    render(<StockOnHandTable rows={rows} grandTotal={20} />);
    expect(screen.getByText('Dairy')).toBeInTheDocument();
  });

  it('shows the grand total row', () => {
    render(<StockOnHandTable rows={rows} grandTotal={20} />);
    expect(screen.getByText('Grand Total')).toBeInTheDocument();
  });
});

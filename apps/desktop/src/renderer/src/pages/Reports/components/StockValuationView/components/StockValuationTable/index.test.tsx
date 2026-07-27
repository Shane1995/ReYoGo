import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockValuationTable } from '.';
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

describe('StockValuationTable', () => {
  it('shows an empty state when there are no rows', () => {
    render(<StockValuationTable rows={[]} grandTotal={0} />);
    expect(screen.getByText('No items in inventory.')).toBeInTheDocument();
  });

  it('renders each item row', () => {
    render(<StockValuationTable rows={rows} grandTotal={20} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('shows the grand total row', () => {
    render(<StockValuationTable rows={rows} grandTotal={20} />);
    expect(screen.getByText('Grand Total')).toBeInTheDocument();
    expect(screen.getAllByText('20.00').length).toBeGreaterThan(0);
  });
});

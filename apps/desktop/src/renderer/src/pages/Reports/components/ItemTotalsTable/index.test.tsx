import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemTotalsTable } from '.';

const rows = [
  {
    itemId: 'item-1',
    itemName: 'Milk',
    categoryName: 'Dairy',
    categoryType: 'food',
    uom: 'L',
    qty: 10,
    totalValue: 40,
  },
  {
    itemId: 'item-2',
    itemName: 'Coke',
    categoryName: 'Beverages',
    categoryType: 'beverage',
    uom: 'L',
    qty: 5,
    totalValue: 25,
  },
];

describe('ItemTotalsTable', () => {
  it('shows the empty message when there are no rows', () => {
    render(<ItemTotalsTable rows={[]} grandTotal={0} emptyMessage="No purchases in this range." />);
    expect(screen.getByText('No purchases in this range.')).toBeDefined();
  });

  it('groups rows by category', () => {
    render(<ItemTotalsTable rows={rows} grandTotal={65} emptyMessage="—" />);
    expect(screen.getByText('Dairy')).toBeDefined();
    expect(screen.getByText('Beverages')).toBeDefined();
  });

  it('lists each item within its category group once expanded', () => {
    render(<ItemTotalsTable rows={rows} grandTotal={65} emptyMessage="—" />);
    expect(screen.getByText('Milk')).toBeDefined();
    expect(screen.getByText('Coke')).toBeDefined();
  });

  it('collapses a category group when its header is clicked', () => {
    render(<ItemTotalsTable rows={rows} grandTotal={65} emptyMessage="—" />);
    fireEvent.click(screen.getByText('Dairy'));
    expect(screen.queryByText('Milk')).toBeNull();
  });
});

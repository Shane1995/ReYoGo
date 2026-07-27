import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemCostHistoryTable } from '.';
import type { ItemCostHistoryRow } from '../../types';

function row(overrides: Partial<ItemCostHistoryRow> = {}): ItemCostHistoryRow {
  return {
    itemId: 'item-1',
    itemName: 'Flour',
    uom: 'kg',
    categoryName: 'Dry Goods',
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 2,
    unitCostExclVat: 10,
    unitCostInclVat: 11.5,
    isVatable: true,
    pctChange: null,
    flagged: false,
    ...overrides,
  };
}

describe('ItemCostHistoryTable', () => {
  it('shows an empty state when there are no rows', () => {
    render(<ItemCostHistoryTable rows={[]} />);
    expect(
      screen.getByText('No purchases for the selected range or category.'),
    ).toBeInTheDocument();
  });

  it('groups items under their category header', () => {
    render(
      <ItemCostHistoryTable
        rows={[
          row({ itemId: 'item-1', itemName: 'Flour', categoryName: 'Dry Goods' }),
          row({ itemId: 'item-2', itemName: 'Coke', categoryName: 'Beverages' }),
        ]}
      />,
    );
    expect(screen.getByText('Beverages')).toBeInTheDocument();
    expect(screen.getByText('Dry Goods')).toBeInTheDocument();
    expect(screen.getByText('Flour')).toBeInTheDocument();
    expect(screen.getByText('Coke')).toBeInTheDocument();
  });

  it('falls back to the uncategorized bucket when an item has no category', () => {
    render(<ItemCostHistoryTable rows={[row({ categoryName: undefined })]} />);
    expect(screen.getByText('Uncategorised')).toBeInTheDocument();
  });
});

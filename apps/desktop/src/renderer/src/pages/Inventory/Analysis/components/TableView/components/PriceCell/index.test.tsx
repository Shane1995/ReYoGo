import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceCell } from '.';
import type { ItemGroup } from '../../../../types';

function entry(
  overrides: Partial<ItemGroup['entries'][number]> = {},
): ItemGroup['entries'][number] {
  return {
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 1,
    unitPrice: 100,
    unitPriceInclVat: 115,
    isVatable: true,
    ...overrides,
  };
}

describe('PriceCell', () => {
  it('labels the VAT-inclusive price when it differs from the VAT-exclusive price', () => {
    render(<PriceCell last={entry()} />);
    expect(screen.getByText('Incl.')).toBeInTheDocument();
    expect(screen.getByText('Excl. 100.00')).toBeInTheDocument();
  });

  it('shows no VAT label when the item has no VAT applied', () => {
    render(<PriceCell last={entry({ unitPrice: 100, unitPriceInclVat: 100 })} />);
    expect(screen.queryByText('Incl.')).not.toBeInTheDocument();
    expect(screen.queryByText(/Excl\./)).not.toBeInTheDocument();
  });
});

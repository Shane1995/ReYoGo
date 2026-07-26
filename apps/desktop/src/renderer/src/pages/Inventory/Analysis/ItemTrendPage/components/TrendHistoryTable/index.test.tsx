import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendHistoryTable } from '.';
import type { ItemGroup } from '../../../types';

describe('TrendHistoryTable', () => {
  it('labels the unit price column as VAT-exclusive', () => {
    render(<TrendHistoryTable entries={[]} />);
    expect(screen.getByText('Unit price (excl. VAT)')).toBeInTheDocument();
  });

  it('renders a row per entry', () => {
    const entries: ItemGroup['entries'] = [
      {
        invoiceId: 'inv-1',
        date: new Date('2026-01-01'),
        quantity: 2,
        unitPrice: 50,
        unitPriceInclVat: 57.5,
      },
    ];
    render(<TrendHistoryTable entries={entries} />);
    expect(screen.getByText('50.00')).toBeInTheDocument();
  });
});

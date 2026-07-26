import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceStatCards } from '.';
import type { Stats } from '../../types';

function stats(overrides: Partial<Stats> = {}): Stats {
  return {
    min: 90,
    max: 110,
    avg: 100,
    first: 90,
    last: 110,
    change: 22.2,
    count: 2,
    uom: 'kg',
    ...overrides,
  };
}

describe('PriceStatCards', () => {
  it('labels the first, latest, and average price cards as VAT-exclusive', () => {
    render(<PriceStatCards stats={stats()} />);
    expect(screen.getByText('First price (excl. VAT)')).toBeInTheDocument();
    expect(screen.getByText('Latest price (excl. VAT)')).toBeInTheDocument();
    expect(screen.getByText('Average price (excl. VAT)')).toBeInTheDocument();
  });
});

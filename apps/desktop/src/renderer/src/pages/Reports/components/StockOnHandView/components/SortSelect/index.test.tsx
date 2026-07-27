import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortSelect } from '.';
import { StockOnHandSortKey } from '../../types';

describe('SortSelect', () => {
  it('lists all sort options', () => {
    render(<SortSelect value={StockOnHandSortKey.Name} onChange={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Name' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Quantity' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Total value' })).toBeDefined();
  });

  it('reflects the current value', () => {
    render(<SortSelect value={StockOnHandSortKey.Quantity} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue(StockOnHandSortKey.Quantity);
  });

  it('calls onChange with the selected sort key', () => {
    const onChange = vi.fn();
    render(<SortSelect value={StockOnHandSortKey.Name} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: StockOnHandSortKey.TotalValue },
    });
    expect(onChange).toHaveBeenCalledWith(StockOnHandSortKey.TotalValue);
  });
});

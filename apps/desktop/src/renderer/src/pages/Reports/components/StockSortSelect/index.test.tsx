import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockSortSelect } from '.';
import { StockSortKey } from '../../hooks/useStockLevelRows/types';

describe('StockSortSelect', () => {
  it('lists all sort options', () => {
    render(<StockSortSelect value={StockSortKey.Name} onChange={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Name' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Quantity' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Total value' })).toBeDefined();
  });

  it('reflects the current value', () => {
    render(<StockSortSelect value={StockSortKey.Quantity} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue(StockSortKey.Quantity);
  });

  it('calls onChange with the selected sort key', () => {
    const onChange = vi.fn();
    render(<StockSortSelect value={StockSortKey.Name} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: StockSortKey.TotalValue },
    });
    expect(onChange).toHaveBeenCalledWith(StockSortKey.TotalValue);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TypeFilter } from '.';

describe('TypeFilter', () => {
  it('shows "All types" when no value is selected', () => {
    render(<TypeFilter value="" options={['food', 'beverage']} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByText('All types')).toBeInTheDocument();
  });

  it('renders each option with its display label', () => {
    render(<TypeFilter value="" options={['food', 'beverage']} onChange={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Foods' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beverages' })).toBeInTheDocument();
  });

  it('calls onChange with the selected value', () => {
    const onChange = vi.fn();
    render(<TypeFilter value="" options={['food', 'beverage']} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'food' } });
    expect(onChange).toHaveBeenCalledWith('food');
  });
});

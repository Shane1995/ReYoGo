import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddUnitForm } from '.';

describe('AddUnitForm', () => {
  it('shows the current value in the input', () => {
    render(<AddUnitForm value="Kilogram" onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByDisplayValue('Kilogram')).toBeDefined();
  });

  it('calls onChange as the user types', () => {
    const onChange = vi.fn();
    render(<AddUnitForm value="" onChange={onChange} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('New unit name'), {
      target: { value: 'Gram' },
    });
    expect(onChange).toHaveBeenCalledWith('Gram');
  });

  it('calls onSubmit when the Add button is clicked', () => {
    const onSubmit = vi.fn();
    render(<AddUnitForm value="Gram" onChange={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onSubmit when Enter is pressed in the input', () => {
    const onSubmit = vi.fn();
    render(<AddUnitForm value="Gram" onChange={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByPlaceholderText('New unit name'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('disables the Add button when the value is empty', () => {
    render(<AddUnitForm value="" onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});

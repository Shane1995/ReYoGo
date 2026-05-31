import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '.';

describe('Checkbox', () => {
  it('renders with role checkbox and correct aria-checked when unchecked', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} />);
    const el = screen.getByRole('checkbox');
    expect(el).toBeDefined();
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('renders aria-checked true when checked', () => {
    render(<Checkbox checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });

  it('renders aria-checked mixed when indeterminate', () => {
    render(<Checkbox checked={false} indeterminate onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('mixed');
  });

  it('calls onChange(true) when unchecked and clicked', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange(false) when checked and clicked', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange when Space is pressed', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    screen.getByRole('checkbox').focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders label text when label prop is provided', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} label="Select all" />);
    expect(screen.getByText('Select all')).toBeDefined();
  });
});

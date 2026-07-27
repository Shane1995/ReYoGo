import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsOfDateFilter } from '.';

describe('AsOfDateFilter', () => {
  it('does not show a Live button when no date is set', () => {
    render(<AsOfDateFilter value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Live' })).not.toBeInTheDocument();
  });

  it('shows a Live button once a date is set', () => {
    render(<AsOfDateFilter value="2026-01-15" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Live' })).toBeInTheDocument();
  });

  it('clears the date when Live is clicked', async () => {
    const onChange = vi.fn();
    render(<AsOfDateFilter value="2026-01-15" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Live' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});

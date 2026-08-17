import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StocktakeSessionSelect } from '.';

const sessions = [
  {
    id: 's1',
    accountId: 'default',
    label: 'Week 1',
    status: 'complete' as const,
    completedAt: new Date(),
    createdAt: new Date(),
  },
];

describe('StocktakeSessionSelect', () => {
  it('always offers an "All Stock" option', () => {
    render(<StocktakeSessionSelect sessions={sessions} value={undefined} onChange={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'All Stock' })).toBeDefined();
  });

  it('lists each completed session by label', () => {
    render(<StocktakeSessionSelect sessions={sessions} value={undefined} onChange={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Week 1' })).toBeDefined();
  });

  it('calls onChange with undefined when All Stock is selected', () => {
    const onChange = vi.fn();
    render(<StocktakeSessionSelect sessions={sessions} value="s1" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onChange with the session id when a session is selected', () => {
    const onChange = vi.fn();
    render(<StocktakeSessionSelect sessions={sessions} value={undefined} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 's1' } });
    expect(onChange).toHaveBeenCalledWith('s1');
  });
});

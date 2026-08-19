import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionPicker } from '.';

const sessions = [
  {
    id: 's1',
    accountId: 'default',
    label: 'Week 1',
    status: 'open' as const,
    completedAt: null,
    createdAt: new Date(),
  },
  {
    id: 's2',
    accountId: 'default',
    label: null,
    status: 'complete' as const,
    completedAt: new Date(),
    createdAt: new Date(),
  },
];

describe('SessionPicker', () => {
  it('lists each session by label, falling back to a generic name', () => {
    render(
      <SessionPicker
        sessions={sessions}
        currentSessionId="s1"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
      />,
    );
    expect(screen.getByRole('option', { name: /Week 1/ })).toBeDefined();
    expect(screen.getByRole('option', { name: /Untitled/ })).toBeDefined();
  });

  it('reflects the current session as the selected value', () => {
    render(
      <SessionPicker
        sessions={sessions}
        currentSessionId="s2"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('s2');
  });

  it('calls onSelect with the chosen session id', () => {
    const onSelect = vi.fn();
    render(
      <SessionPicker
        sessions={sessions}
        currentSessionId="s1"
        onSelect={onSelect}
        onCreate={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 's2' } });
    expect(onSelect).toHaveBeenCalledWith('s2');
  });

  it('calls onCreate when the new stock sheet button is clicked', () => {
    const onCreate = vi.fn();
    render(
      <SessionPicker
        sessions={sessions}
        currentSessionId="s1"
        onSelect={vi.fn()}
        onCreate={onCreate}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /New Stock Sheet/i }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('shows a status badge for the currently selected session', () => {
    render(
      <SessionPicker
        sessions={sessions}
        currentSessionId="s2"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
      />,
    );
    expect(screen.getByText('Completed')).toBeDefined();
  });

  it('shows an open badge for an in-progress session', () => {
    render(
      <SessionPicker
        sessions={sessions}
        currentSessionId="s1"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
      />,
    );
    expect(screen.getByText('Open')).toBeDefined();
  });
});

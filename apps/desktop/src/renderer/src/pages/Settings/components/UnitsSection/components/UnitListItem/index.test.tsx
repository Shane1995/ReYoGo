import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnitListItem } from '.';

const unit = { id: 'u1', name: 'Kilogram', usageCount: 3 };

describe('UnitListItem', () => {
  it('shows the unit name and usage count', () => {
    render(<UnitListItem unit={unit} onRename={vi.fn()} onArchive={vi.fn()} />);
    expect(screen.getByText('Kilogram')).toBeDefined();
    expect(screen.getByText('3 items')).toBeDefined();
  });

  it('calls onArchive with the unit id', () => {
    const onArchive = vi.fn();
    render(<UnitListItem unit={unit} onRename={vi.fn()} onArchive={onArchive} />);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onArchive).toHaveBeenCalledWith('u1');
  });

  it('calls onRename with the edited name on save', () => {
    const onRename = vi.fn();
    render(<UnitListItem unit={unit} onRename={onRename} onArchive={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    const input = screen.getByDisplayValue('Kilogram');
    fireEvent.change(input, { target: { value: 'Kilo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onRename).toHaveBeenCalledWith('u1', 'Kilo');
  });
});

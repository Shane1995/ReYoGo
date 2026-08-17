import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchivedUnitRow } from '.';

describe('ArchivedUnitRow', () => {
  it('shows the unit name and usage count', () => {
    render(
      <ArchivedUnitRow
        unit={{ id: 'u1', name: 'Gram', usageCount: 0 }}
        onRestore={vi.fn()}
        onHardDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Gram')).toBeDefined();
    expect(screen.getByText('0 items')).toBeDefined();
  });

  it('calls onRestore with the unit id', () => {
    const onRestore = vi.fn();
    render(
      <ArchivedUnitRow
        unit={{ id: 'u1', name: 'Gram', usageCount: 0 }}
        onRestore={onRestore}
        onHardDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith('u1');
  });

  it('enables delete and calls onHardDelete when usage is zero', () => {
    const onHardDelete = vi.fn();
    render(
      <ArchivedUnitRow
        unit={{ id: 'u1', name: 'Gram', usageCount: 0 }}
        onRestore={vi.fn()}
        onHardDelete={onHardDelete}
      />,
    );
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toBeDisabled();
    fireEvent.click(deleteButton);
    expect(onHardDelete).toHaveBeenCalledWith('u1');
  });

  it('disables delete when the unit still has usage', () => {
    render(
      <ArchivedUnitRow
        unit={{ id: 'u1', name: 'Gram', usageCount: 2 }}
        onRestore={vi.fn()}
        onHardDelete={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});

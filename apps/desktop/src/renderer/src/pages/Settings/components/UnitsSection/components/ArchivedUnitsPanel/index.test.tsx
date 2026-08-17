import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchivedUnitsPanel } from '.';

describe('ArchivedUnitsPanel', () => {
  it('shows an empty state when there are no archived units', () => {
    render(<ArchivedUnitsPanel units={[]} onRestore={vi.fn()} onHardDelete={vi.fn()} />);
    expect(screen.getByText('No archived units')).toBeDefined();
  });

  it('lists each archived unit', () => {
    render(
      <ArchivedUnitsPanel
        units={[
          { id: 'u1', name: 'Gram', usageCount: 0 },
          { id: 'u2', name: 'Ounce', usageCount: 1 },
        ]}
        onRestore={vi.fn()}
        onHardDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Gram')).toBeDefined();
    expect(screen.getByText('Ounce')).toBeDefined();
  });

  it('calls onRestore for the clicked unit', () => {
    const onRestore = vi.fn();
    render(
      <ArchivedUnitsPanel
        units={[{ id: 'u1', name: 'Gram', usageCount: 0 }]}
        onRestore={onRestore}
        onHardDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith('u1');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompleteCountDialog } from '.';

describe('CompleteCountDialog', () => {
  it('shows the counted value to confirm', () => {
    render(
      <CompleteCountDialog
        open
        completing={false}
        uncountedCount={0}
        totalValue={1234.5}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText('R 1 234,50')).toBeDefined();
  });

  it('warns when items are left uncounted', () => {
    render(
      <CompleteCountDialog
        open
        completing={false}
        uncountedCount={3}
        totalValue={1234.5}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/3 items have not been counted/)).toBeDefined();
  });

  it('calls onConfirm when confirmed', () => {
    const onConfirm = vi.fn();
    render(
      <CompleteCountDialog
        open
        completing={false}
        uncountedCount={0}
        totalValue={0}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Complete Count/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    const onClose = vi.fn();
    render(
      <CompleteCountDialog
        open
        completing={false}
        uncountedCount={0}
        totalValue={0}
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportFooter } from '.';

describe('ImportFooter', () => {
  it('shows "Nothing selected" and disables commit when nothing is selected', () => {
    render(
      <ImportFooter
        selectedNew={0}
        commitLabel="Commit to database"
        onCommit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Nothing selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Commit to database' })).toBeDisabled();
  });

  it('shows a singular row count', () => {
    render(
      <ImportFooter selectedNew={1} commitLabel="Commit" onCommit={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('1 row selected to import')).toBeInTheDocument();
  });

  it('shows a plural row count and enables commit', () => {
    const onCommit = vi.fn();
    render(
      <ImportFooter selectedNew={3} commitLabel="Commit" onCommit={onCommit} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('3 rows selected to import')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }));
    expect(onCommit).toHaveBeenCalled();
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ImportFooter selectedNew={0} commitLabel="Commit" onCommit={vi.fn()} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

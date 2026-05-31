import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RowActions } from '.';

const baseProps = {
  isPosted: false,
  isPosting: false,
  isCreditNote: false,
  onReuse: vi.fn(),
  onEdit: vi.fn(),
  onPost: vi.fn(),
  onAudit: vi.fn(),
  onRaiseCreditNote: vi.fn(),
};

describe('RowActions', () => {
  it('shows Raise credit note for posted invoices', async () => {
    render(<RowActions {...baseProps} isPosted={true} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Raise credit note')).toBeDefined();
  });

  it('does not show Raise credit note for draft invoices', async () => {
    render(<RowActions {...baseProps} isPosted={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Raise credit note')).toBeNull();
  });

  it('shows only Audit log for credit note rows', async () => {
    render(<RowActions {...baseProps} isCreditNote={true} isPosted={true} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Audit log')).toBeDefined();
    expect(screen.queryByText('Raise credit note')).toBeNull();
    expect(screen.queryByText('Reuse')).toBeNull();
    expect(screen.queryByText('Edit')).toBeNull();
  });
});

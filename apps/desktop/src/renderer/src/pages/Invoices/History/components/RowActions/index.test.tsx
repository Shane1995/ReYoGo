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
  onEditDetails: vi.fn(),
  onPost: vi.fn(),
  onAudit: vi.fn(),
  onRaiseCreditNote: vi.fn(),
};

describe('RowActions', () => {
  it('shows Report Damage / Return for posted invoices', async () => {
    render(<RowActions {...baseProps} isPosted={true} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Report Damage / Return')).toBeDefined();
  });

  it('does not show Report Damage / Return for draft invoices', async () => {
    render(<RowActions {...baseProps} isPosted={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Report Damage / Return')).toBeNull();
  });

  it('shows Edit lines for both drafts and posted invoices', async () => {
    render(<RowActions {...baseProps} isPosted={true} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Edit lines')).toBeDefined();
  });

  it('shows Edit details only for posted invoices', async () => {
    render(<RowActions {...baseProps} isPosted={false} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Edit details')).toBeNull();
  });

  it('calls onEdit when Edit lines is clicked', async () => {
    const onEdit = vi.fn();
    render(<RowActions {...baseProps} isPosted={true} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Edit lines'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onEditDetails when Edit details is clicked', async () => {
    const onEditDetails = vi.fn();
    render(<RowActions {...baseProps} isPosted={true} onEditDetails={onEditDetails} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Edit details'));
    expect(onEditDetails).toHaveBeenCalled();
  });

  it('shows only Audit log for credit note rows', async () => {
    render(<RowActions {...baseProps} isCreditNote={true} isPosted={true} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Audit log')).toBeDefined();
    expect(screen.queryByText('Report Damage / Return')).toBeNull();
    expect(screen.queryByText('Reuse')).toBeNull();
    expect(screen.queryByText('Edit lines')).toBeNull();
  });
});

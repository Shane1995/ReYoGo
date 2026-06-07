import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraftConflictModal } from './index';

const defaultProps = {
  open: true,
  draftItemCount: 3,
  onAppend: vi.fn(),
  onFresh: vi.fn(),
  onCancel: vi.fn(),
};

describe('DraftConflictModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<DraftConflictModal {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when open is true', () => {
    render(<DraftConflictModal {...defaultProps} />);
    expect(screen.getByText('Draft invoice in progress')).toBeInTheDocument();
  });

  it('shows pluralised item count for multiple items', () => {
    render(<DraftConflictModal {...defaultProps} draftItemCount={3} />);
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('shows singular item count for one item', () => {
    render(<DraftConflictModal {...defaultProps} draftItemCount={1} />);
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('calls onAppend when Append to draft button is clicked', async () => {
    const onAppend = vi.fn();
    render(<DraftConflictModal {...defaultProps} onAppend={onAppend} />);
    await userEvent.click(screen.getByText('Append to draft'));
    expect(onAppend).toHaveBeenCalledOnce();
  });

  it('calls onFresh when Start fresh button is clicked', async () => {
    const onFresh = vi.fn();
    render(<DraftConflictModal {...defaultProps} onFresh={onFresh} />);
    await userEvent.click(screen.getByText('Start fresh'));
    expect(onFresh).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel link is clicked', async () => {
    const onCancel = vi.fn();
    render(<DraftConflictModal {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when clicking the overlay', async () => {
    const onCancel = vi.fn();
    render(<DraftConflictModal {...defaultProps} onCancel={onCancel} />);
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) await userEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

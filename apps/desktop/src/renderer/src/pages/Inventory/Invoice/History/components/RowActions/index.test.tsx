import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RowActions } from '.';

const defaultProps = {
  isPosted: false,
  isPosting: false,
  onReuse: vi.fn(),
  onEdit: vi.fn(),
  onPost: vi.fn(),
  onAudit: vi.fn(),
};

async function openMenu() {
  await userEvent.click(screen.getByRole('button'));
}

describe('RowActions', () => {
  describe('draft invoice', () => {
    it('shows Reuse, Edit, Post, and Audit log after opening', async () => {
      render(<RowActions {...defaultProps} />);
      await openMenu();
      expect(screen.getByText('Reuse')).toBeDefined();
      expect(screen.getByText('Edit')).toBeDefined();
      expect(screen.getByText('Post')).toBeDefined();
      expect(screen.getByText('Audit log')).toBeDefined();
    });

    it('calls onReuse when Reuse is clicked', async () => {
      const onReuse = vi.fn();
      render(<RowActions {...defaultProps} onReuse={onReuse} />);
      await openMenu();
      await userEvent.click(screen.getByText('Reuse'));
      expect(onReuse).toHaveBeenCalledOnce();
    });

    it('calls onEdit when Edit is clicked', async () => {
      const onEdit = vi.fn();
      render(<RowActions {...defaultProps} onEdit={onEdit} />);
      await openMenu();
      await userEvent.click(screen.getByText('Edit'));
      expect(onEdit).toHaveBeenCalledOnce();
    });

    it('calls onPost when Post is clicked', async () => {
      const onPost = vi.fn();
      render(<RowActions {...defaultProps} onPost={onPost} />);
      await openMenu();
      await userEvent.click(screen.getByText('Post'));
      expect(onPost).toHaveBeenCalledOnce();
    });

    it('shows "Posting…" and disables the button while isPosting', async () => {
      render(<RowActions {...defaultProps} isPosting />);
      await openMenu();
      const postBtn = screen.getByText('Posting…').closest('button');
      expect(postBtn?.disabled).toBe(true);
    });
  });

  describe('posted invoice', () => {
    it('shows Reuse, Edit, and Audit log but not Post', async () => {
      render(<RowActions {...defaultProps} isPosted />);
      await openMenu();
      expect(screen.getByText('Reuse')).toBeDefined();
      expect(screen.getByText('Edit')).toBeDefined();
      expect(screen.getByText('Audit log')).toBeDefined();
      expect(screen.queryByText('Post')).toBeNull();
    });
  });
});

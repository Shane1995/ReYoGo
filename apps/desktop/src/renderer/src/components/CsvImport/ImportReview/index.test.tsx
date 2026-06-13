import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryType } from '@reyogo/types';
import { ImportReview } from '.';
import { UNIT_STATUS, CATEGORY_STATUS, ITEM_STATUS } from '../review';
import type { ReviewResult } from '../review';

function makeReview(overrides: Partial<ReviewResult> = {}): ReviewResult {
  return {
    units: [{ name: 'litres', status: UNIT_STATUS.New, selected: true }],
    categories: [
      {
        id: 'cat-1',
        name: 'Dairy',
        type: InventoryType.Food,
        status: CATEGORY_STATUS.New,
        selected: true,
      },
    ],
    items: [
      {
        name: 'Milk',
        categoryName: 'Dairy',
        unit: 'litres',
        status: ITEM_STATUS.New,
        selected: true,
      },
    ],
    parseErrors: [],
    availableCategories: [{ name: 'Dairy', type: InventoryType.Food }],
    counts: { newTotal: 3, existsTotal: 0, unresolvedTotal: 0 },
    ...overrides,
  };
}

describe('ImportReview', () => {
  it('renders units, categories, and items', () => {
    render(<ImportReview review={makeReview()} onCommit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('litres')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('shows the unresolved-items warning when items need a category', () => {
    render(
      <ImportReview
        review={makeReview({
          items: [
            {
              name: 'Bleach',
              categoryName: 'Cleaning',
              status: ITEM_STATUS.Unresolved,
              selected: false,
              unresolvedReason: 'Category not found: Cleaning',
            },
          ],
        })}
        onCommit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("1 item has a category that wasn't found.")).toBeInTheDocument();
  });

  it('shows the type-warning banner for categories with an unrecognised type', () => {
    render(
      <ImportReview
        review={makeReview({
          categories: [
            {
              id: 'cat-1',
              name: 'Misc',
              type: 'unknown' as InventoryType,
              status: CATEGORY_STATUS.New,
              selected: true,
              typeWarning: true,
            },
          ],
        })}
        onCommit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('1 category has an unrecognised type.')).toBeInTheDocument();
  });

  it('shows parse errors when present', () => {
    render(
      <ImportReview
        review={makeReview({ parseErrors: ['Items row 3: missing name'] })}
        onCommit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/import warning/)).toBeInTheDocument();
  });

  it('calls onCommit with the current selections when committing', () => {
    const onCommit = vi.fn();
    render(<ImportReview review={makeReview()} onCommit={onCommit} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Commit to database' }));
    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({ units: expect.any(Array), items: expect.any(Array) }),
    );
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<ImportReview review={makeReview()} onCommit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

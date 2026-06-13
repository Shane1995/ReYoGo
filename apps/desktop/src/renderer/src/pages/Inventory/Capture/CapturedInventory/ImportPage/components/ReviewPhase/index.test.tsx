import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryType } from '@reyogo/types';
import { ReviewPhase } from '.';
import { UNIT_STATUS, CATEGORY_STATUS, ITEM_STATUS } from '@/components/CsvImport/review';
import type { ReviewResult } from '@/components/CsvImport/review';

function makeReview(): ReviewResult {
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
  };
}

describe('ReviewPhase', () => {
  it('renders nothing outside the review phase', () => {
    const { container } = render(
      <ReviewPhase state={{ phase: 'idle' }} onCommit={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the review and calls onCancel', () => {
    const onCancel = vi.fn();
    render(
      <ReviewPhase
        state={{ phase: 'review', review: makeReview() }}
        onCommit={vi.fn()}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemsSection } from '.';
import { ReviewStatus } from '../review';

describe('ItemsSection', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(
      <ItemsSection
        items={[]}
        availableCategories={[]}
        onToggle={vi.fn()}
        onAssignCategory={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a row per item', () => {
    render(
      <ItemsSection
        items={[
          {
            name: 'Milk',
            categoryName: 'Dairy',
            unit: 'litres',
            status: ReviewStatus.New,
            selected: true,
          },
          {
            name: 'Cola',
            categoryName: 'Beverages',
            unit: 'litres',
            status: ReviewStatus.Exists,
            selected: false,
          },
        ]}
        availableCategories={[]}
        onToggle={vi.fn()}
        onAssignCategory={vi.fn()}
      />,
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Cola')).toBeInTheDocument();
  });
});

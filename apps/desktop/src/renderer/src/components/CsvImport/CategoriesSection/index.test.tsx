import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoriesSection } from '.';
import { CATEGORY_STATUS } from '../review';
import { InventoryType } from '@reyogo/types';

describe('CategoriesSection', () => {
  it('renders nothing when there are no categories', () => {
    const { container } = render(
      <CategoriesSection categories={[]} onToggle={vi.fn()} onFixType={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a row per category', () => {
    render(
      <CategoriesSection
        categories={[
          {
            id: 'cat-1',
            name: 'Dairy',
            type: InventoryType.Food,
            status: CATEGORY_STATUS.New,
            selected: true,
          },
          {
            id: 'cat-2',
            name: 'Beverages',
            type: InventoryType.Beverage,
            status: CATEGORY_STATUS.Exists,
            selected: false,
          },
        ]}
        onToggle={vi.fn()}
        onFixType={vi.fn()}
      />,
    );
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Beverages')).toBeInTheDocument();
  });
});

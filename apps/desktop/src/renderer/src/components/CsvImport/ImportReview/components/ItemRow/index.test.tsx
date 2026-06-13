import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemRow } from '.';
import { ReviewStatus } from '../../../review';

const baseItem = {
  name: 'Milk',
  categoryName: 'Dairy',
  unit: 'litres',
  status: ReviewStatus.New,
  selected: true,
};

describe('ItemRow', () => {
  it('renders a new item as selectable with its category and unit', () => {
    const onToggle = vi.fn();
    render(
      <ItemRow
        item={baseItem}
        availableCategories={[]}
        onToggle={onToggle}
        onAssignCategory={vi.fn()}
      />,
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Dairy · litres')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('Milk');
  });

  it('disables an existing item', () => {
    render(
      <ItemRow
        item={{ ...baseItem, status: ReviewStatus.Exists, selected: false }}
        availableCategories={[]}
        onToggle={vi.fn()}
        onAssignCategory={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByText('Already exists')).toBeInTheDocument();
  });

  it('shows a category select for an unresolved item', () => {
    const onAssignCategory = vi.fn();
    render(
      <ItemRow
        item={{ ...baseItem, status: ReviewStatus.Unresolved, selected: false, unit: undefined }}
        availableCategories={[{ name: 'Dairy' }, { name: 'Beverages' }]}
        onToggle={vi.fn()}
        onAssignCategory={onAssignCategory}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Beverages' } });
    expect(onAssignCategory).toHaveBeenCalledWith('Milk', 'Beverages');
  });
});

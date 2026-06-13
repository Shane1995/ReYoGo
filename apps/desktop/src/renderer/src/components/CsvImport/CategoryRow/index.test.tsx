import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryRow } from '.';
import { CATEGORY_STATUS } from '../review';
import { InventoryType } from '@reyogo/types';

const baseCategory = {
  id: 'cat-1',
  name: 'Dairy',
  type: InventoryType.Food,
  status: CATEGORY_STATUS.New,
  selected: true,
};

describe('CategoryRow', () => {
  it('renders a new category as selectable', () => {
    const onToggle = vi.fn();
    render(<CategoryRow category={baseCategory} onToggle={onToggle} onFixType={vi.fn()} />);
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('cat-1');
  });

  it('disables an existing category', () => {
    render(
      <CategoryRow
        category={{ ...baseCategory, status: CATEGORY_STATUS.Exists, selected: false }}
        onToggle={vi.fn()}
        onFixType={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByText('Already exists')).toBeInTheDocument();
  });

  it('shows a type select for a new category with an unrecognised type', () => {
    const onFixType = vi.fn();
    render(
      <CategoryRow
        category={{ ...baseCategory, type: 'unknown' as InventoryType, typeWarning: true }}
        onToggle={vi.fn()}
        onFixType={onFixType}
      />,
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: InventoryType.Beverage } });
    expect(onFixType).toHaveBeenCalledWith('cat-1', InventoryType.Beverage);
  });

  it('does not show a type select when there is no type warning', () => {
    render(<CategoryRow category={baseCategory} onToggle={vi.fn()} onFixType={vi.fn()} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText(InventoryType.Food)).toBeInTheDocument();
  });
});

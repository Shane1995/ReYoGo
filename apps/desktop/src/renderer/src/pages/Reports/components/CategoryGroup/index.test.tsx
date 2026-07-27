import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryGroup } from '.';

describe('CategoryGroup', () => {
  it('renders the category name, item count, and children when expanded', () => {
    render(
      <CategoryGroup category="Dairy" count={2} isExpanded onToggle={vi.fn()}>
        <p>item rows</p>
      </CategoryGroup>,
    );
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('item rows')).toBeInTheDocument();
  });

  it('shows singular item count for a single row', () => {
    render(
      <CategoryGroup category="Dairy" count={1} isExpanded onToggle={vi.fn()}>
        <p>item rows</p>
      </CategoryGroup>,
    );
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('hides children when collapsed', () => {
    render(
      <CategoryGroup category="Dairy" count={1} isExpanded={false} onToggle={vi.fn()}>
        <p>item rows</p>
      </CategoryGroup>,
    );
    expect(screen.queryByText('item rows')).not.toBeInTheDocument();
  });

  it('renders the optional summary slot', () => {
    render(
      <CategoryGroup category="Dairy" count={1} isExpanded onToggle={vi.fn()} summary="R 810.00">
        <p>item rows</p>
      </CategoryGroup>,
    );
    expect(screen.getByText('R 810.00')).toBeInTheDocument();
  });

  it('calls onToggle with the category name when the header is clicked', () => {
    const onToggle = vi.fn();
    render(
      <CategoryGroup category="Dairy" count={1} isExpanded onToggle={onToggle}>
        <p>item rows</p>
      </CategoryGroup>,
    );
    fireEvent.click(screen.getByText('Dairy'));
    expect(onToggle).toHaveBeenCalledWith('Dairy');
  });
});

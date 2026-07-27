import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from '.';

describe('CategoryFilter', () => {
  it('shows "All categories" when nothing is selected', () => {
    render(<CategoryFilter selected={[]} options={['Dairy', 'Beverages']} onChange={vi.fn()} />);
    expect(screen.getByText('All categories')).toBeInTheDocument();
  });

  it('shows the selected count on the trigger', () => {
    render(
      <CategoryFilter selected={['Dairy']} options={['Dairy', 'Beverages']} onChange={vi.fn()} />,
    );
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('lists every option when the trigger is clicked', async () => {
    render(<CategoryFilter selected={[]} options={['Dairy', 'Beverages']} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /all categories/i }));
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Beverages')).toBeInTheDocument();
  });

  it('calls onChange with the category added when an unselected option is clicked', async () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter selected={['Dairy']} options={['Dairy', 'Beverages']} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /1 selected/i }));
    await userEvent.click(screen.getByText('Beverages'));
    expect(onChange).toHaveBeenCalledWith(['Dairy', 'Beverages']);
  });

  it('calls onChange with the category removed when a selected option is clicked', async () => {
    const onChange = vi.fn();
    render(
      <CategoryFilter
        selected={['Dairy', 'Beverages']}
        options={['Dairy', 'Beverages']}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /2 selected/i }));
    await userEvent.click(screen.getByText('Dairy'));
    expect(onChange).toHaveBeenCalledWith(['Beverages']);
  });

  it('shows an empty state when there are no options', async () => {
    render(<CategoryFilter selected={[]} options={[]} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /all categories/i }));
    expect(screen.getByText('No categories')).toBeInTheDocument();
  });
});

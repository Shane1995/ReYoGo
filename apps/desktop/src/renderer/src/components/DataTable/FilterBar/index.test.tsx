import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from './index';
import type { FilterField, FilterValues } from '../types';

const searchField: FilterField = {
  key: 'search',
  label: 'Items',
  type: 'search',
  placeholder: 'Search…',
};
const selectField: FilterField = {
  key: 'type',
  label: 'Type',
  type: 'select',
  options: [
    { value: 'food', label: 'Food' },
    { value: 'beverage', label: 'Beverage' },
  ],
};
const multiField: FilterField = {
  key: 'category',
  label: 'Categories',
  type: 'select',
  multi: true,
  options: [
    { value: 'cat-1', label: 'Poultry' },
    { value: 'cat-2', label: 'Dairy' },
  ],
};

describe('FilterBar', () => {
  describe('search field', () => {
    it('renders an input with the placeholder', () => {
      render(
        <FilterBar filters={[searchField]} values={{}} onChange={() => {}} onClearAll={() => {}} />,
      );
      expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
    });

    it('calls onChange when a character is typed', async () => {
      const onChange = vi.fn();
      render(
        <FilterBar filters={[searchField]} values={{}} onChange={onChange} onClearAll={() => {}} />,
      );
      await userEvent.type(screen.getByPlaceholderText('Search…'), 'c');
      expect(onChange).toHaveBeenCalledWith('search', 'c');
    });

    it('reflects controlled value', () => {
      render(
        <FilterBar
          filters={[searchField]}
          values={{ search: 'apple' }}
          onChange={() => {}}
          onClearAll={() => {}}
        />,
      );
      expect(screen.getByDisplayValue('apple')).toBeInTheDocument();
    });
  });

  describe('single-select field', () => {
    it('renders the field label as trigger text', () => {
      render(
        <FilterBar filters={[selectField]} values={{}} onChange={() => {}} onClearAll={() => {}} />,
      );
      expect(screen.getByRole('button', { name: /type/i })).toBeInTheDocument();
    });

    it('shows options in popover when trigger is clicked', async () => {
      render(
        <FilterBar filters={[selectField]} values={{}} onChange={() => {}} onClearAll={() => {}} />,
      );
      await userEvent.click(screen.getByRole('button', { name: /type/i }));
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Beverage')).toBeInTheDocument();
    });

    it('calls onChange with selected value', async () => {
      const onChange = vi.fn();
      render(
        <FilterBar filters={[selectField]} values={{}} onChange={onChange} onClearAll={() => {}} />,
      );
      await userEvent.click(screen.getByRole('button', { name: /type/i }));
      await userEvent.click(screen.getByText('Food'));
      expect(onChange).toHaveBeenCalledWith('type', 'food');
    });

    it('popover content has scroll classes', async () => {
      render(
        <FilterBar filters={[selectField]} values={{}} onChange={() => {}} onClearAll={() => {}} />,
      );
      await userEvent.click(screen.getByRole('button', { name: /type/i }));
      const popover = document.querySelector('[data-slot="popover-content"]');
      expect(popover?.className).toContain('max-h-72');
      expect(popover?.className).toContain('overflow-y-auto');
    });
  });

  describe('multi-select field', () => {
    it('shows the badge count when options are selected', () => {
      render(
        <FilterBar
          filters={[multiField]}
          values={{ category: ['cat-1', 'cat-2'] } as FilterValues}
          onChange={() => {}}
          onClearAll={() => {}}
        />,
      );
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('popover content has scroll classes', async () => {
      render(
        <FilterBar filters={[multiField]} values={{}} onChange={() => {}} onClearAll={() => {}} />,
      );
      await userEvent.click(screen.getByRole('button', { name: /categories/i }));
      const popover = document.querySelector('[data-slot="popover-content"]');
      expect(popover?.className).toContain('max-h-72');
      expect(popover?.className).toContain('overflow-y-auto');
    });
  });

  describe('clear all', () => {
    it('does not show clear button when no filters are active', () => {
      render(
        <FilterBar filters={[searchField]} values={{}} onChange={() => {}} onClearAll={() => {}} />,
      );
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('shows and triggers clear when a filter is active', async () => {
      const onClearAll = vi.fn();
      render(
        <FilterBar
          filters={[searchField]}
          values={{ search: 'x' }}
          onChange={() => {}}
          onClearAll={onClearAll}
        />,
      );
      const clearBtn = screen.getByRole('button', { name: /clear/i });
      await userEvent.click(clearBtn);
      expect(onClearAll).toHaveBeenCalledOnce();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildArchivedItemColumns } from '.';
import type { ArchivedItem } from '../../types';

const item: ArchivedItem = {
  id: 'item-1',
  name: 'Bleach',
  categoryName: 'Cleaning',
  unitOfMeasure: 'Litre',
};

const itemWithoutUnit: ArchivedItem = {
  id: 'item-2',
  name: 'Sponges',
  categoryName: 'Cleaning',
};

function findColumn(columns: ReturnType<typeof buildArchivedItemColumns>, key: string) {
  const column = columns.find((c) => c.key === key);
  if (!column) throw new Error(`Column not found: ${key}`);
  return column;
}

describe('buildArchivedItemColumns', () => {
  it('renders the item name with a struck-through style', () => {
    const columns = buildArchivedItemColumns(vi.fn());
    render(<>{findColumn(columns, 'name').cell(item)}</>);
    expect(screen.getByText('Bleach')).toHaveClass('line-through');
  });

  it('renders the category name', () => {
    const columns = buildArchivedItemColumns(vi.fn());
    render(<>{findColumn(columns, 'category').cell(item)}</>);
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
  });

  it('renders a badge when a unit of measure is present', () => {
    const columns = buildArchivedItemColumns(vi.fn());
    render(<>{findColumn(columns, 'unit').cell(item)}</>);
    expect(screen.getByText('Litre')).toBeInTheDocument();
  });

  it('renders a placeholder when no unit of measure is present', () => {
    const columns = buildArchivedItemColumns(vi.fn());
    render(<>{findColumn(columns, 'unit').cell(itemWithoutUnit)}</>);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls onUnarchive with the row id when the unarchive button is clicked', async () => {
    const onUnarchive = vi.fn();
    const columns = buildArchivedItemColumns(onUnarchive);
    render(<>{findColumn(columns, 'actions').cell(item)}</>);

    await userEvent.click(screen.getByRole('button', { name: /unarchive/i }));

    expect(onUnarchive).toHaveBeenCalledWith('item-1');
  });

  it('marks the name and category columns as sortable', () => {
    const columns = buildArchivedItemColumns(vi.fn());
    expect(findColumn(columns, 'name').sortable).toBe(true);
    expect(findColumn(columns, 'category').sortable).toBe(true);
  });
});

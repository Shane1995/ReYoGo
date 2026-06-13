import { describe, it, expect } from 'vitest';
import { isSortableColumn } from '.';
import type { ColumnDef } from '../../types';

const baseColumn: ColumnDef<{ name: string }> = {
  key: 'name',
  header: 'Name',
  cell: (row) => row.name,
};

describe('isSortableColumn', () => {
  it('returns true when sortable and a sortFn are both set', () => {
    expect(isSortableColumn({ ...baseColumn, sortable: true, sortFn: () => 0 })).toBe(true);
  });

  it('returns false when sortable is missing', () => {
    expect(isSortableColumn({ ...baseColumn, sortFn: () => 0 })).toBe(false);
  });

  it('returns false when sortFn is missing', () => {
    expect(isSortableColumn({ ...baseColumn, sortable: true })).toBe(false);
  });

  it('returns false when neither is set', () => {
    expect(isSortableColumn(baseColumn)).toBe(false);
  });
});

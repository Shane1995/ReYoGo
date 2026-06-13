import { describe, it, expect } from 'vitest';
import { deriveCompareFns } from '.';
import type { ColumnDef } from '../../types';

type Row = { id: string; name: string; qty: number };

const nameSort = (a: Row, b: Row) => a.name.localeCompare(b.name);
const qtySort = (a: Row, b: Row) => a.qty - b.qty;

describe('deriveCompareFns', () => {
  it('returns an empty map when no columns have a sortFn', () => {
    const columns: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', cell: (r) => r.name }];
    expect(deriveCompareFns(columns)).toEqual({});
  });

  it('maps each column key with a sortFn to its compare function', () => {
    const columns: ColumnDef<Row>[] = [
      { key: 'name', header: 'Name', cell: (r) => r.name, sortFn: nameSort },
      { key: 'qty', header: 'Qty', cell: (r) => String(r.qty), sortFn: qtySort },
    ];
    const result = deriveCompareFns(columns);
    expect(result.name).toBe(nameSort);
    expect(result.qty).toBe(qtySort);
  });

  it('skips columns without a sortFn', () => {
    const columns: ColumnDef<Row>[] = [
      { key: 'name', header: 'Name', cell: (r) => r.name, sortFn: nameSort },
      { key: 'id', header: 'ID', cell: (r) => r.id },
    ];
    expect(Object.keys(deriveCompareFns(columns))).toEqual(['name']);
  });
});

import { describe, it, expect } from 'vitest';
import { columnWidthsOf } from '.';

describe('columnWidthsOf', () => {
  it('sizes each column to its longest cell plus padding', () => {
    const rows = [
      ['Item', 'Qty'],
      ['300ml Coke Zero', 48],
    ];
    expect(columnWidthsOf(rows)).toEqual([{ wch: 17 }, { wch: 10 }]);
  });

  it('falls back to a minimum width for short columns', () => {
    const rows = [
      ['A', 'B'],
      ['x', 'y'],
    ];
    expect(columnWidthsOf(rows)).toEqual([{ wch: 10 }, { wch: 10 }]);
  });

  it('returns an empty array for empty input', () => {
    expect(columnWidthsOf([])).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { buildPeriodSummarySheetRows } from '.';
import type { COGSSummary } from '@reyogo/types';

const cogs: COGSSummary = {
  total: 150,
  byCategory: [
    { categoryId: 'c1', categoryName: 'Dairy', total: 100 },
    { categoryId: 'c2', categoryName: null, total: 50 },
  ],
};

describe('buildPeriodSummarySheetRows', () => {
  it('emits a header row, one row per category, and a total row', () => {
    const sheet = buildPeriodSummarySheetRows(cogs);
    expect(sheet[0]).toEqual(['Category', 'COGS', '% of Total']);
    expect(sheet[1]).toEqual(['Dairy', 100, '66.7%']);
    expect(sheet[2]).toEqual(['Uncategorised', 50, '33.3%']);
    expect(sheet[3]).toEqual(['Total', 150, '100.0%']);
  });

  it('handles a zero total without dividing by zero', () => {
    const sheet = buildPeriodSummarySheetRows({ total: 0, byCategory: [] });
    expect(sheet).toEqual([
      ['Category', 'COGS', '% of Total'],
      ['Total', 0, '—'],
    ]);
  });
});

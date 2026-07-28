import { describe, it, expect } from 'vitest';
import { matchScannedLineToItem } from './index';

const items = [
  { id: '1', name: 'Tomatoes, Cherry' },
  { id: '2', name: 'Olive Oil Extra Virgin' },
  { id: '3', name: 'Basil Fresh' },
];

describe('matchScannedLineToItem', () => {
  it('matches an exact name', () => {
    expect(matchScannedLineToItem('Basil Fresh', items)).toEqual({ itemId: '3', matched: true });
  });

  it('matches a description containing the item name', () => {
    expect(matchScannedLineToItem('Cherry Tomatoes 5kg box', items)).toEqual({
      itemId: '1',
      matched: true,
    });
  });

  it('matches on partial word overlap', () => {
    expect(matchScannedLineToItem('Extra Virgin Olive Oil 1L', items)).toEqual({
      itemId: '2',
      matched: true,
    });
  });

  it('returns unmatched when nothing scores above the threshold', () => {
    expect(matchScannedLineToItem('Frozen Chicken Breast', items)).toEqual({
      itemId: '',
      matched: false,
    });
  });

  it('returns unmatched for an empty item list', () => {
    expect(matchScannedLineToItem('Basil Fresh', [])).toEqual({ itemId: '', matched: false });
  });
});

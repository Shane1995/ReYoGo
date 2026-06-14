import { describe, it, expect } from 'vitest';
import { tipEntryOf } from '.';
import type { TipEntry } from '../../types';

const entry: TipEntry = { fullDate: 'Jan 1, 2026', price: 10, qty: 2 };

describe('tipEntryOf', () => {
  it('returns null when payload is undefined', () => {
    expect(tipEntryOf(undefined)).toBeNull();
  });

  it('returns null when payload is empty', () => {
    expect(tipEntryOf([])).toBeNull();
  });

  it('returns the first payload entry', () => {
    expect(tipEntryOf([{ payload: entry }])).toEqual(entry);
  });
});

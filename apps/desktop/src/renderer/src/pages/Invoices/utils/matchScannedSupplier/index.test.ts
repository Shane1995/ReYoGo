import { describe, it, expect } from 'vitest';
import { matchScannedSupplier } from './index';

const suppliers = [
  { id: '1', name: 'Acme Foods Ltd' },
  { id: '2', name: 'Fresh Produce Co' },
];

describe('matchScannedSupplier', () => {
  it('returns empty string when the scanned name is null', () => {
    expect(matchScannedSupplier(null, suppliers)).toBe('');
  });

  it('matches an exact (case-insensitive) name', () => {
    expect(matchScannedSupplier('acme foods ltd', suppliers)).toBe('1');
  });

  it('matches a partial name', () => {
    expect(matchScannedSupplier('Fresh Produce', suppliers)).toBe('2');
  });

  it('returns empty string when no supplier matches', () => {
    expect(matchScannedSupplier('Unknown Supplier Inc', suppliers)).toBe('');
  });
});

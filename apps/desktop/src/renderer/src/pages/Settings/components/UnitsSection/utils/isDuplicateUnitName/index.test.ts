import { describe, it, expect } from 'vitest';
import { isDuplicateUnitName } from '.';
import type { UnitOfMeasure } from '@reyogo/types';

const units: UnitOfMeasure[] = [
  { id: 'u1', name: 'Kilogram' },
  { id: 'u2', name: 'Litre' },
];

describe('isDuplicateUnitName', () => {
  it('is true when the name matches an existing unit case-insensitively', () => {
    expect(isDuplicateUnitName(units, 'kilogram')).toBe(true);
  });

  it('is false when the name does not match any existing unit', () => {
    expect(isDuplicateUnitName(units, 'Gram')).toBe(false);
  });

  it('ignores surrounding whitespace when comparing', () => {
    expect(isDuplicateUnitName(units, '  Litre  ')).toBe(true);
  });

  it('excludes the given unit id from the comparison, for renames', () => {
    expect(isDuplicateUnitName(units, 'Kilogram', 'u1')).toBe(false);
  });

  it('still flags a duplicate against a different unit id during a rename', () => {
    expect(isDuplicateUnitName(units, 'Litre', 'u1')).toBe(true);
  });
});

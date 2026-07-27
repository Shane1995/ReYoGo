import { describe, it, expect } from 'vitest';
import { VatMode } from '@reyogo/types';
import { totalColumnLabelOf } from '.';

describe('totalColumnLabelOf', () => {
  it('reads "Total (excl.)" for exclusive VAT treatment', () => {
    expect(totalColumnLabelOf(VatMode.Exclusive)).toBe('Total (excl.)');
  });

  it('reads "Total (incl.)" for inclusive VAT treatment', () => {
    expect(totalColumnLabelOf(VatMode.Inclusive)).toBe('Total (incl.)');
  });
});

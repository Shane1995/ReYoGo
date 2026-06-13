import { describe, it, expect } from 'vitest';
import { resolveOptions } from '.';
import type { FilterField } from '../../../types';

describe('resolveOptions', () => {
  it('returns an empty array when the field has no options', () => {
    const field: FilterField = { key: 'status', label: 'Status', type: 'select' };
    expect(resolveOptions(field, {})).toEqual([]);
  });

  it('returns the static options array as-is', () => {
    const options = [{ value: 'a', label: 'A' }];
    const field: FilterField = { key: 'status', label: 'Status', type: 'select', options };
    expect(resolveOptions(field, {})).toBe(options);
  });

  it('invokes a function and passes the current filter values', () => {
    const field: FilterField = {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: (values) => [{ value: String(values['parent']), label: 'Child' }],
    };
    expect(resolveOptions(field, { parent: 'a' })).toEqual([{ value: 'a', label: 'Child' }]);
  });
});

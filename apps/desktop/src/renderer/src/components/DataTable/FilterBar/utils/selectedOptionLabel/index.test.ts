import { describe, it, expect } from 'vitest';
import { selectedOptionLabel } from '.';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('selectedOptionLabel', () => {
  it('returns the fallback when nothing is selected', () => {
    expect(selectedOptionLabel('', options, 'All')).toBe('All');
  });

  it('returns the matching option label', () => {
    expect(selectedOptionLabel('b', options, 'All')).toBe('Beta');
  });

  it('returns the fallback when the selected value has no matching option', () => {
    expect(selectedOptionLabel('z', options, 'All')).toBe('All');
  });
});

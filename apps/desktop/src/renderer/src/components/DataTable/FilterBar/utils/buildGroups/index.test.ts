import { describe, it, expect } from 'vitest';
import { buildGroups } from '.';

describe('buildGroups', () => {
  it('returns a single ungrouped group when no option has a group', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    expect(buildGroups(options)).toEqual([{ label: '', items: options }]);
  });

  it('groups options by their group label, preserving first-seen order', () => {
    const options = [
      { value: 'a', label: 'A', group: 'Fruit' },
      { value: 'b', label: 'B', group: 'Veg' },
      { value: 'c', label: 'C', group: 'Fruit' },
    ];
    expect(buildGroups(options)).toEqual([
      { label: 'Fruit', items: [options[0], options[2]] },
      { label: 'Veg', items: [options[1]] },
    ]);
  });

  it('places ungrouped options into a group with an empty label', () => {
    const options = [
      { value: 'a', label: 'A', group: 'Fruit' },
      { value: 'b', label: 'B' },
    ];
    expect(buildGroups(options)).toEqual([
      { label: 'Fruit', items: [options[0]] },
      { label: '', items: [options[1]] },
    ]);
  });
});

import { describe, it, expect } from 'vitest';
import { triggerLabelOf } from '.';

describe('triggerLabelOf', () => {
  it('reads "All categories" when nothing is selected', () => {
    expect(triggerLabelOf([])).toBe('All categories');
  });

  it('shows the count when one category is selected', () => {
    expect(triggerLabelOf(['Dairy'])).toBe('1 selected');
  });

  it('shows the count when multiple categories are selected', () => {
    expect(triggerLabelOf(['Dairy', 'Beverages'])).toBe('2 selected');
  });
});

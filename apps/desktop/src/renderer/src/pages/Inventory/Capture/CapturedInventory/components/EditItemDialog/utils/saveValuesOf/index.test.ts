import { describe, it, expect } from 'vitest';
import type { InventoryCategory } from '../../../../types';
import { saveValuesOf } from '.';

describe('saveValuesOf', () => {
  const category: InventoryCategory = { id: 'cat-1', name: 'Produce', type: 'food' };

  it('builds save values with the selected category type', () => {
    expect(saveValuesOf('  Tomatoes  ', 'cat-1', category, 'unit-1')).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
      unitOfMeasureId: 'unit-1',
    });
  });

  it('maps an empty unit of measure to null', () => {
    expect(saveValuesOf('Tomatoes', 'cat-1', category, '')).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
      unitOfMeasureId: null,
    });
  });

  it('falls back to an empty type when no category is selected', () => {
    expect(saveValuesOf('Tomatoes', 'cat-1', undefined, 'unit-1')).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: '',
      unitOfMeasureId: 'unit-1',
    });
  });
});

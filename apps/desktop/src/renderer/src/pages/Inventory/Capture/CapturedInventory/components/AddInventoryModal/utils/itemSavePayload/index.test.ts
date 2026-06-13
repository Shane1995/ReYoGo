import { describe, it, expect } from 'vitest';
import { itemSavePayload } from '.';

describe('itemSavePayload', () => {
  const category = { type: 'food' };

  it('builds a payload when all required fields are present', () => {
    expect(itemSavePayload('Tomatoes', 'cat-1', category, 'unit-1', 'entity-1')).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
      unitOfMeasureId: 'unit-1',
      entityId: 'entity-1',
    });
  });

  it('maps an empty unit of measure to null', () => {
    expect(itemSavePayload('Tomatoes', 'cat-1', category, '', 'entity-1')).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
      unitOfMeasureId: null,
      entityId: 'entity-1',
    });
  });

  it('returns null when category is missing', () => {
    expect(itemSavePayload('Tomatoes', 'cat-1', undefined, 'unit-1', 'entity-1')).toBeNull();
  });

  it('returns null when entityId is missing', () => {
    expect(itemSavePayload('Tomatoes', 'cat-1', category, 'unit-1', null)).toBeNull();
  });

  it('returns null when name or category id is empty', () => {
    expect(itemSavePayload('', 'cat-1', category, 'unit-1', 'entity-1')).toBeNull();
    expect(itemSavePayload('Tomatoes', '', category, 'unit-1', 'entity-1')).toBeNull();
  });
});

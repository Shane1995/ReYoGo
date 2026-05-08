import { describe, expect, it } from 'vitest';
import {
  CreateInventoryCategorySchema,
  CreateInventoryItemSchema,
  InventoryCategorySchema,
  InventoryItemSchema,
  InventorySubmitPayloadSchema,
} from './inventory';

const CAT_ID = '550e8400-e29b-41d4-a716-446655440000';
const ITEM_ID = '550e8400-e29b-41d4-a716-446655440001';

describe('InventoryCategorySchema', () => {
  it('accepts a valid category', () => {
    const result = InventoryCategorySchema.parse({
      id: CAT_ID,
      name: 'Beverages',
      type: 'consumable',
    });
    expect(result.id).toBe(CAT_ID);
  });

  it('rejects a missing name', () => {
    expect(() => InventoryCategorySchema.parse({ id: CAT_ID, type: 'consumable' })).toThrow();
  });

  it('rejects an empty name', () => {
    expect(() =>
      InventoryCategorySchema.parse({ id: CAT_ID, name: '', type: 'consumable' }),
    ).toThrow();
  });

  it('rejects a non-UUID id', () => {
    expect(() =>
      InventoryCategorySchema.parse({ id: 'not-a-uuid', name: 'Beverages', type: 'consumable' }),
    ).toThrow();
  });
});

describe('CreateInventoryCategorySchema', () => {
  it('accepts a create payload without id', () => {
    const result = CreateInventoryCategorySchema.parse({ name: 'Beverages', type: 'consumable' });
    expect(result.name).toBe('Beverages');
  });
});

describe('InventoryItemSchema', () => {
  it('accepts a valid item', () => {
    const result = InventoryItemSchema.parse({
      id: ITEM_ID,
      name: 'Full Cream Milk',
      categoryId: CAT_ID,
      type: 'consumable',
    });
    expect(result.name).toBe('Full Cream Milk');
  });

  it('accepts an optional unitOfMeasure', () => {
    const result = InventoryItemSchema.parse({
      id: ITEM_ID,
      name: 'Full Cream Milk',
      categoryId: CAT_ID,
      type: 'consumable',
      unitOfMeasure: 'L',
    });
    expect(result.unitOfMeasure).toBe('L');
  });

  it('rejects a non-UUID categoryId', () => {
    expect(() =>
      InventoryItemSchema.parse({
        id: ITEM_ID,
        name: 'Full Cream Milk',
        categoryId: 'bad',
        type: 'consumable',
      }),
    ).toThrow();
  });
});

describe('CreateInventoryItemSchema', () => {
  it('accepts a create payload without id', () => {
    const result = CreateInventoryItemSchema.parse({
      name: 'Full Cream Milk',
      categoryId: CAT_ID,
      type: 'consumable',
    });
    expect(result.name).toBe('Full Cream Milk');
  });
});

describe('InventorySubmitPayloadSchema', () => {
  it('accepts an empty submit payload', () => {
    const result = InventorySubmitPayloadSchema.parse({
      addedCategories: [],
      addedItems: [],
      updatedCategories: [],
      updatedItems: [],
      deletedCategoryIds: [],
      deletedItemIds: [],
    });
    expect(result.addedCategories).toHaveLength(0);
  });

  it('rejects a deletedCategoryId that is not a UUID', () => {
    expect(() =>
      InventorySubmitPayloadSchema.parse({
        addedCategories: [],
        addedItems: [],
        updatedCategories: [],
        updatedItems: [],
        deletedCategoryIds: ['not-a-uuid'],
        deletedItemIds: [],
      }),
    ).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import {
  ReferenceTypeSchema,
  StockMovementSchema,
  StockMovementTypeSchema,
} from './stockMovements';

const ID = '550e8400-e29b-41d4-a716-446655440000';
const INVENTORY_ITEM_ID = '550e8400-e29b-41d4-a716-446655440001';
const BASE = {
  id: ID,
  inventoryItemId: INVENTORY_ITEM_ID,
  stockQtyAfter: 10,
  referenceType: null,
  referenceId: null,
  notes: null,
  unitCostAtTime: null,
  totalCost: null,
  weightedAvgCostAfter: null,
  occurredAt: '2026-05-08T10:00:00.000Z',
  createdAt: '2026-05-08T10:00:00.000Z',
};

describe('StockMovementTypeSchema', () => {
  it('accepts valid types', () => {
    expect(StockMovementTypeSchema.parse('IN')).toBe('IN');
    expect(StockMovementTypeSchema.parse('OUT')).toBe('OUT');
    expect(StockMovementTypeSchema.parse('ADJUSTMENT')).toBe('ADJUSTMENT');
    expect(StockMovementTypeSchema.parse('WASTE')).toBe('WASTE');
    expect(StockMovementTypeSchema.parse('RETURN')).toBe('RETURN');
  });

  it('rejects an invalid type', () => {
    expect(() => StockMovementTypeSchema.parse('TRANSFER')).toThrow();
  });
});

describe('ReferenceTypeSchema', () => {
  it('accepts valid reference types', () => {
    expect(ReferenceTypeSchema.parse('invoice')).toBe('invoice');
    expect(ReferenceTypeSchema.parse('manual')).toBe('manual');
    expect(ReferenceTypeSchema.parse('adjustment')).toBe('adjustment');
  });

  it('rejects an invalid reference type', () => {
    expect(() => ReferenceTypeSchema.parse('usage')).toThrow();
  });
});

describe('StockMovementSchema', () => {
  it('accepts a valid IN movement', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      movementType: 'IN',
      qty: 10,
    });
    expect(result.movementType).toBe('IN');
  });

  it('accepts a WASTE movement', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      movementType: 'WASTE',
      qty: 3,
    });
    expect(result.movementType).toBe('WASTE');
  });

  it('accepts a RETURN movement', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      movementType: 'RETURN',
      qty: 1,
    });
    expect(result.movementType).toBe('RETURN');
  });

  it('accepts optional nullable fields as null', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      movementType: 'OUT',
      qty: 2,
      referenceType: null,
      referenceId: null,
      unitCostAtTime: null,
      totalCost: null,
      weightedAvgCostAfter: null,
      notes: null,
    });
    expect(result.referenceId).toBeNull();
    expect(result.unitCostAtTime).toBeNull();
  });

  it('accepts a referenceType and referenceId', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      movementType: 'IN',
      qty: 5,
      referenceType: 'invoice',
      referenceId: '550e8400-e29b-41d4-a716-446655440099',
    });
    expect(result.referenceType).toBe('invoice');
  });

  it('rejects a non-ISO createdAt', () => {
    expect(() =>
      StockMovementSchema.parse({
        ...BASE,
        movementType: 'IN',
        qty: 1,
        createdAt: 'yesterday',
      }),
    ).toThrow();
  });

  it('rejects a non-ISO occurredAt', () => {
    expect(() =>
      StockMovementSchema.parse({
        ...BASE,
        movementType: 'IN',
        qty: 1,
        occurredAt: 'last week',
      }),
    ).toThrow();
  });
});

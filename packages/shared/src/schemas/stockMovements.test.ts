import { describe, expect, it } from 'vitest';
import {
  StockMovementSchema,
  StockMovementSourceSchema,
  StockMovementTypeSchema,
} from './stockMovements';

const ID = '550e8400-e29b-41d4-a716-446655440000';
const ITEM_ID = '550e8400-e29b-41d4-a716-446655440001';
const BASE = {
  id: ID,
  itemId: ITEM_ID,
  itemNameSnapshot: 'Full Cream Milk',
  createdAt: '2026-05-08T10:00:00.000Z',
};

describe('StockMovementTypeSchema', () => {
  it('accepts valid types', () => {
    expect(StockMovementTypeSchema.parse('IN')).toBe('IN');
    expect(StockMovementTypeSchema.parse('OUT')).toBe('OUT');
    expect(StockMovementTypeSchema.parse('ADJUSTMENT')).toBe('ADJUSTMENT');
  });

  it('rejects an invalid type', () => {
    expect(() => StockMovementTypeSchema.parse('TRANSFER')).toThrow();
  });
});

describe('StockMovementSourceSchema', () => {
  it('accepts valid sources', () => {
    expect(StockMovementSourceSchema.parse('invoice')).toBe('invoice');
    expect(StockMovementSourceSchema.parse('usage')).toBe('usage');
    expect(StockMovementSourceSchema.parse('adjustment')).toBe('adjustment');
  });

  it('rejects an invalid source', () => {
    expect(() => StockMovementSourceSchema.parse('manual')).toThrow();
  });
});

describe('StockMovementSchema', () => {
  it('accepts a valid IN movement', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      type: 'IN',
      quantity: 10,
      source: 'invoice',
    });
    expect(result.type).toBe('IN');
  });

  it('accepts an ADJUSTMENT with negative quantity', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      type: 'ADJUSTMENT',
      quantity: -3,
      source: 'adjustment',
    });
    expect(result.quantity).toBe(-3);
  });

  it('accepts optional nullable fields as null', () => {
    const result = StockMovementSchema.parse({
      ...BASE,
      type: 'OUT',
      quantity: 2,
      source: 'usage',
      referenceId: null,
      costAtTime: null,
      cogsAmount: null,
    });
    expect(result.referenceId).toBeNull();
  });

  it('rejects a zero quantity', () => {
    expect(() =>
      StockMovementSchema.parse({ ...BASE, type: 'IN', quantity: 0, source: 'invoice' }),
    ).toThrow();
  });

  it('rejects a non-ISO createdAt', () => {
    expect(() =>
      StockMovementSchema.parse({
        ...BASE,
        type: 'IN',
        quantity: 1,
        source: 'invoice',
        createdAt: 'yesterday',
      }),
    ).toThrow();
  });
});

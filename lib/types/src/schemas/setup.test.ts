import { describe, expect, it } from 'vitest';
import { CreateUnitOfMeasureSchema, UnitOfMeasureSchema } from './setup';

describe('UnitOfMeasureSchema', () => {
  it('accepts a valid unit', () => {
    const result = UnitOfMeasureSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Litre',
    });
    expect(result.name).toBe('Litre');
  });

  it('rejects an empty name', () => {
    expect(() =>
      UnitOfMeasureSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000', name: '' }),
    ).toThrow();
  });

  it('rejects a name exceeding 50 characters', () => {
    expect(() =>
      UnitOfMeasureSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A'.repeat(51),
      }),
    ).toThrow();
  });

  it('rejects a non-UUID id', () => {
    expect(() => UnitOfMeasureSchema.parse({ id: 'bad', name: 'Litre' })).toThrow();
  });
});

describe('CreateUnitOfMeasureSchema', () => {
  it('accepts a create payload without id', () => {
    const result = CreateUnitOfMeasureSchema.parse({ name: 'Kilogram' });
    expect(result.name).toBe('Kilogram');
  });
});

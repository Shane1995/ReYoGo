import { describe, it, expect } from 'vitest';
import { typeLabel } from './index';

describe('typeLabel', () => {
  it('returns the known label for a recognised category type', () => {
    expect(typeLabel('food')).toBe('Foods');
    expect(typeLabel('beverage')).toBe('Beverages');
    expect(typeLabel('non-food')).toBe('Non-food');
  });

  it('capitalises an unrecognised category type', () => {
    expect(typeLabel('other')).toBe('Other');
  });
});

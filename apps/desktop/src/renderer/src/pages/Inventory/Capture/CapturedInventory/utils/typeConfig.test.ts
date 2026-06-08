import { describe, it, expect } from 'vitest';
import { typeGroupLabel, getTypeConfig } from './typeConfig';

describe('typeGroupLabel', () => {
  it('returns emoji + capitalised label for food', () => {
    expect(typeGroupLabel('food')).toBe('🍴 Food');
  });

  it('returns emoji + capitalised label for beverage', () => {
    expect(typeGroupLabel('beverage')).toBe('🥤 Beverage');
  });

  it('replaces hyphens with non-breaking hyphens for non-food', () => {
    const label = typeGroupLabel('non-food');
    expect(label).toBe('📦 Non‑food');
  });

  it('capitalises the first letter of an unknown type', () => {
    expect(typeGroupLabel('produce')).toBe('Produce');
  });

  it('replaces hyphens in unknown hyphenated types', () => {
    const label = typeGroupLabel('dry-goods');
    expect(label).toBe('Dry‑goods');
  });
});

describe('getTypeConfig', () => {
  it('returns a config with the expected emerald styling for food', () => {
    const config = getTypeConfig('food', ['food']);
    expect(config.color).toBe('text-emerald-700 dark:text-emerald-400');
    expect(config.treeLine).toBe('border-emerald-200 dark:border-emerald-800');
  });

  it('returns a config with the expected sky styling for beverage', () => {
    const config = getTypeConfig('beverage', ['beverage']);
    expect(config.color).toBe('text-sky-700 dark:text-sky-400');
    expect(config.treeLine).toBe('border-sky-200 dark:border-sky-800');
  });

  it('returns a config with the expected amber styling for non-food', () => {
    const config = getTypeConfig('non-food', ['non-food']);
    expect(config.color).toBe('text-amber-700 dark:text-amber-400');
    expect(config.treeLine).toBe('border-amber-200 dark:border-amber-800');
  });

  it('cycles through the fallback palette for unknown types', () => {
    const allTypes = ['food', 'produce'];
    const config = getTypeConfig('produce', allTypes);
    expect(config).toBeDefined();
    expect(config.badgeClass).toBeTruthy();
  });

  it('returns a stable config for the same unknown type', () => {
    const allTypes = ['unknown'];
    expect(getTypeConfig('unknown', allTypes)).toEqual(getTypeConfig('unknown', allTypes));
  });
});

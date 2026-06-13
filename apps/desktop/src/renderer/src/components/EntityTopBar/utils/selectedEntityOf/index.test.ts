import { describe, it, expect } from 'vitest';
import { selectedEntityOf } from '.';

const entities = [
  { id: 'a', name: 'Acme' },
  { id: 'b', name: 'Beta' },
];

describe('selectedEntityOf', () => {
  it('returns the entity matching the selected id', () => {
    expect(selectedEntityOf(entities, 'b')).toEqual({ id: 'b', name: 'Beta' });
  });

  it('falls back to the first entity when the selected id is not found', () => {
    expect(selectedEntityOf(entities, 'missing')).toEqual({ id: 'a', name: 'Acme' });
  });

  it('falls back to the first entity when no id is selected', () => {
    expect(selectedEntityOf(entities, undefined)).toEqual({ id: 'a', name: 'Acme' });
  });

  it('returns null when there are no entities', () => {
    expect(selectedEntityOf([], undefined)).toBeNull();
  });
});

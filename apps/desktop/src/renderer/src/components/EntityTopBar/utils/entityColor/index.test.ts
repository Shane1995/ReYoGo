import { describe, it, expect } from 'vitest';
import { ENTITY_COLORS } from '../../constants';
import { entityColor } from '.';

describe('entityColor', () => {
  it('returns a deterministic color based on the id', () => {
    expect(entityColor('a')).toEqual(ENTITY_COLORS[2]);
    expect(entityColor('b')).toEqual(ENTITY_COLORS[3]);
  });

  it('returns the same color for the same id', () => {
    expect(entityColor('entity-123')).toEqual(entityColor('entity-123'));
  });

  it('falls back to the first color for an empty id', () => {
    expect(entityColor('')).toEqual(ENTITY_COLORS[0]);
  });
});

import { describe, it, expect } from 'vitest';
import { cogsSharePctOf } from '.';

describe('cogsSharePctOf', () => {
  it('returns the percentage share formatted to one decimal place', () => {
    expect(cogsSharePctOf(25, 100)).toBe('25.0%');
  });

  it('returns an em dash when the total is zero', () => {
    expect(cogsSharePctOf(25, 0)).toBe('—');
  });

  it('returns an em dash when the total is negative', () => {
    expect(cogsSharePctOf(25, -10)).toBe('—');
  });
});

import { describe, it, expect } from 'vitest';
import { now } from '.';

describe('now', () => {
  it('returns a Date instance', () => {
    expect(now()).toBeInstanceOf(Date);
  });

  it('returns a timestamp within a second of the current time', () => {
    const before = Date.now();
    const result = now();
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it('returns a new instance on each call', () => {
    expect(now()).not.toBe(now());
  });
});

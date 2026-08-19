import { describe, it, expect } from 'vitest';
import { isFullyCredited } from '.';

describe('isFullyCredited', () => {
  it('is false when nothing has been credited', () => {
    expect(isFullyCredited(10, 0)).toBe(false);
  });

  it('is false when only part of the qty has been credited', () => {
    expect(isFullyCredited(10, 6)).toBe(false);
  });

  it('is true when the full qty has been credited', () => {
    expect(isFullyCredited(10, 10)).toBe(true);
  });

  it('treats floating point noise within epsilon as fully credited', () => {
    expect(isFullyCredited(10, 9.9999999999)).toBe(true);
  });

  it('is true when more than the recorded qty has somehow been credited', () => {
    expect(isFullyCredited(10, 10.5)).toBe(true);
  });
});

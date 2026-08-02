import { describe, it, expect } from 'vitest';
import { resolveResizeDimensions } from './index';

describe('resolveResizeDimensions', () => {
  it('scales down an oversized image so the long edge becomes exactly 2576px, preserving aspect ratio', () => {
    expect(resolveResizeDimensions({ width: 4000, height: 2000 })).toEqual({
      width: 2576,
      height: 1288,
    });
  });

  it('scales up a tiny image so the long edge becomes exactly 1568px, preserving aspect ratio', () => {
    expect(resolveResizeDimensions({ width: 500, height: 250 })).toEqual({
      width: 1568,
      height: 784,
    });
  });

  it('returns an in-range image unchanged', () => {
    expect(resolveResizeDimensions({ width: 2000, height: 1500 })).toEqual({
      width: 2000,
      height: 1500,
    });
  });

  it('leaves an image with long edge exactly at the max threshold unchanged', () => {
    expect(resolveResizeDimensions({ width: 2576, height: 1288 })).toEqual({
      width: 2576,
      height: 1288,
    });
  });

  it('leaves an image with long edge exactly at the min threshold unchanged', () => {
    expect(resolveResizeDimensions({ width: 1024, height: 768 })).toEqual({
      width: 1024,
      height: 768,
    });
  });
});

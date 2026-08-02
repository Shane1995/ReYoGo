import { describe, it, expect } from 'vitest';
import { stretchLuminanceContrast } from './index';

describe('stretchLuminanceContrast', () => {
  it('returns an unchanged copy for a flat, uniform-luminance image', () => {
    const pixels = new Uint8ClampedArray([
      90, 90, 90, 255, 90, 90, 90, 200, 90, 90, 90, 50, 90, 90, 90, 0,
    ]);

    const result = stretchLuminanceContrast(pixels, 0.005, 0.995);

    expect(result).toEqual(pixels);
    expect(result).not.toBe(pixels);
  });

  it('stretches a narrow mid-range image toward the 0-255 range when clipLow=0/clipHigh=1', () => {
    const pixels = new Uint8ClampedArray([100, 100, 100, 255, 130, 130, 130, 10, 150, 150, 150, 0]);

    const result = stretchLuminanceContrast(pixels, 0, 1);

    expect(Array.from(result)).toEqual([0, 0, 0, 255, 153, 153, 153, 10, 255, 255, 255, 0]);
  });

  it('preserves the alpha channel unchanged', () => {
    const pixels = new Uint8ClampedArray([
      100, 100, 100, 255, 130, 130, 130, 10, 150, 150, 150, 42,
    ]);

    const result = stretchLuminanceContrast(pixels, 0, 1);

    expect(result[3]).toBe(255);
    expect(result[7]).toBe(10);
    expect(result[11]).toBe(42);
  });

  it('does not let a single extreme outlier pixel drag the black point to 0 under percentile clipping', () => {
    const outlier = [0, 0, 0, 255];
    const midGrayPixel = [130, 130, 130, 255];
    const midGrayPixels = Array.from({ length: 100 }, () => midGrayPixel).flat();
    const brightPixel = [170, 170, 170, 255];
    const brightPixels = Array.from({ length: 99 }, () => brightPixel).flat();
    const pixels = new Uint8ClampedArray([...outlier, ...midGrayPixels, ...brightPixels]);

    const result = stretchLuminanceContrast(pixels, 0.005, 0.995);

    expect(result[4]).toBe(0);
    expect(result[5]).toBe(0);
    expect(result[6]).toBe(0);
  });
});

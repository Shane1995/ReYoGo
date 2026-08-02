const HISTOGRAM_BUCKETS = 256;

function computeLuminance(r: number, g: number, b: number): number {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

function buildLuminanceHistogram(pixels: Uint8ClampedArray): number[] {
  const histogram = new Array<number>(HISTOGRAM_BUCKETS).fill(0);
  for (let i = 0; i < pixels.length; i += 4) {
    const luminance = computeLuminance(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!);
    histogram[luminance]! += 1;
  }
  return histogram;
}

function percentileLevelFromBottom(histogram: number[], threshold: number): number {
  let cumulative = 0;
  for (let level = 0; level < HISTOGRAM_BUCKETS; level++) {
    cumulative += histogram[level]!;
    if (cumulative > threshold) return level;
  }
  return HISTOGRAM_BUCKETS - 1;
}

function percentileLevelFromTop(histogram: number[], threshold: number): number {
  let cumulative = 0;
  for (let level = HISTOGRAM_BUCKETS - 1; level >= 0; level--) {
    cumulative += histogram[level]!;
    if (cumulative > threshold) return level;
  }
  return 0;
}

export function stretchLuminanceContrast(
  pixels: Uint8ClampedArray,
  clipLow: number,
  clipHigh: number,
): Uint8ClampedArray {
  const pixelCount = pixels.length / 4;
  const histogram = buildLuminanceHistogram(pixels);
  const blackPoint = percentileLevelFromBottom(histogram, clipLow * pixelCount);
  const whitePoint = percentileLevelFromTop(histogram, (1 - clipHigh) * pixelCount);

  if (whitePoint <= blackPoint) {
    return Uint8ClampedArray.from(pixels);
  }

  const scale = 255 / (whitePoint - blackPoint);
  const stretched = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < pixels.length; i += 4) {
    stretched[i] = (pixels[i]! - blackPoint) * scale;
    stretched[i + 1] = (pixels[i + 1]! - blackPoint) * scale;
    stretched[i + 2] = (pixels[i + 2]! - blackPoint) * scale;
    stretched[i + 3] = pixels[i + 3]!;
  }
  return stretched;
}

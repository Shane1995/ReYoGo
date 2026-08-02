import { describe, it, expect } from 'vitest';
import { resolveDisplayConfidence } from './index';

describe('resolveDisplayConfidence', () => {
  it('returns the raw confidence when there are no warnings', () => {
    expect(resolveDisplayConfidence('high', false)).toBe('high');
  });

  it('returns needsReview when there are warnings, even if confidence is high', () => {
    expect(resolveDisplayConfidence('high', true)).toBe('needsReview');
  });

  it('returns needsReview when there are warnings and confidence is medium or low', () => {
    expect(resolveDisplayConfidence('medium', true)).toBe('needsReview');
    expect(resolveDisplayConfidence('low', true)).toBe('needsReview');
  });
});

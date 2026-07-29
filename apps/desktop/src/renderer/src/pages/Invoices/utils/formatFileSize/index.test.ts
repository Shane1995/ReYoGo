import { describe, it, expect } from 'vitest';
import { formatFileSize } from './index';

describe('formatFileSize', () => {
  it('formats sizes under 1MB in KB', () => {
    expect(formatFileSize(2048)).toBe('2KB');
  });

  it('formats sizes at or above 1MB in MB with one decimal', () => {
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5MB');
  });
});

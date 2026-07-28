import { describe, it, expect } from 'vitest';
import { canRetryScan } from './index';

describe('canRetryScan', () => {
  it('is true when there was an error and a file is still selected', () => {
    const file = new File(['x'], 'invoice.png', { type: 'image/png' });
    expect(canRetryScan('error', file)).toBe(true);
  });

  it('is false when there was an error but no file is selected', () => {
    expect(canRetryScan('error', null)).toBe(false);
  });

  it('is false for non-error statuses', () => {
    expect(canRetryScan('idle', new File(['x'], 'invoice.png', { type: 'image/png' }))).toBe(false);
  });
});

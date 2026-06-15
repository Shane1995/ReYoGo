import { describe, expect, it } from 'vitest';
import { createEmptyLine } from './index';

describe('createEmptyLine', () => {
  it('returns an empty, non-vatable line with zeroed values', () => {
    const line = createEmptyLine();
    expect(line.itemId).toBe('');
    expect(line.quantity).toBe(0);
    expect(line.isVatable).toBe(false);
    expect(line.totalVatExclude).toBe(0);
  });

  it('assigns a unique id to each line', () => {
    const a = createEmptyLine();
    const b = createEmptyLine();
    expect(a.id).not.toBe(b.id);
  });
});

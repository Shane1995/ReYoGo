import { describe, it, expect } from 'vitest';
import { rowClassName, dotClassName, valueClassName } from '.';

describe('rowClassName', () => {
  it('includes the counted background tint when counted', () => {
    expect(rowClassName(true)).toContain('bg-emerald-50/60');
  });

  it('omits the counted background tint when not counted', () => {
    expect(rowClassName(false)).not.toContain('bg-emerald-50/60');
  });
});

describe('dotClassName', () => {
  it('is emerald when counted', () => {
    expect(dotClassName(true)).toContain('bg-emerald-500');
  });

  it('is not emerald when not counted', () => {
    expect(dotClassName(false)).not.toContain('bg-emerald-500');
  });
});

describe('valueClassName', () => {
  it('is muted when not counted', () => {
    expect(valueClassName(false)).toContain('text-muted-foreground');
  });

  it('is not muted when counted', () => {
    expect(valueClassName(true)).not.toContain('text-muted-foreground');
  });
});

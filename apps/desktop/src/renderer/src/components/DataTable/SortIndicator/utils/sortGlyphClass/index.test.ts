import { describe, it, expect } from 'vitest';
import { sortGlyphClass } from '.';

describe('sortGlyphClass', () => {
  it('highlights the target glyph when active and matching', () => {
    expect(sortGlyphClass(true, 'asc', 'asc')).toBe('text-[var(--nav-active-border)]');
  });

  it('dims the glyph when active but pointing the other direction', () => {
    expect(sortGlyphClass(true, 'asc', 'desc')).toBe('opacity-30');
  });

  it('dims the glyph when inactive', () => {
    expect(sortGlyphClass(false, null, 'asc')).toBe('opacity-30');
  });
});

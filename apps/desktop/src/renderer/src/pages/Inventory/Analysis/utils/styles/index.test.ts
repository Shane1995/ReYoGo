import { describe, it, expect } from 'vitest';
import { changeCls } from './index';

describe('changeCls', () => {
  it('returns the muted colour for a null value', () => {
    expect(changeCls(null)).toContain('text-muted-foreground');
  });

  it('returns the destructive colour for a positive value', () => {
    expect(changeCls(1)).toContain('text-destructive');
  });

  it('returns the green colour for a negative value', () => {
    expect(changeCls(-1)).toContain('text-green-600');
  });

  it('returns the muted colour for zero', () => {
    expect(changeCls(0)).toContain('text-muted-foreground');
  });

  it('includes a bold class when bold is true', () => {
    expect(changeCls(1, true)).toContain('font-semibold');
  });

  it('does not include a bold class by default', () => {
    expect(changeCls(1)).not.toContain('font-semibold');
  });

  it('always includes the font-mono class', () => {
    expect(changeCls(null)).toContain('font-mono');
  });
});

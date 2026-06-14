import { describe, it, expect } from 'vitest';
import { chevronClassName } from './index';

describe('chevronClassName', () => {
  it('rotates and highlights the chevron when expanded', () => {
    const result = chevronClassName(true);
    expect(result).toContain('rotate-90');
    expect(result).toContain('text-primary');
  });

  it('does not rotate the chevron when not expanded', () => {
    const result = chevronClassName(false);
    expect(result).not.toContain('rotate-90');
    expect(result).toContain('text-muted-foreground/30');
  });
});

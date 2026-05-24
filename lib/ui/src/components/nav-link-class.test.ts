import { describe, it, expect } from 'vitest';
import { navLinkClass } from './nav-link-class';

describe('navLinkClass', () => {
  it('returns a string', () => {
    expect(typeof navLinkClass({ isActive: false })).toBe('string');
  });

  it('includes active border class when active', () => {
    expect(navLinkClass({ isActive: true })).toContain('border-l-[var(--nav-active-border)]');
  });

  it('includes transparent border class when inactive', () => {
    expect(navLinkClass({ isActive: false })).toContain('border-l-transparent');
  });

  it('includes nav accent background when active', () => {
    expect(navLinkClass({ isActive: true })).toContain('bg-[var(--nav-accent)]');
  });

  it('includes muted foreground text when inactive', () => {
    expect(navLinkClass({ isActive: false })).toContain('text-[var(--nav-foreground-muted)]');
  });
});

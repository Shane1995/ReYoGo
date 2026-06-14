import { describe, it, expect } from 'vitest';
import { groupRowClassName } from './index';

describe('groupRowClassName', () => {
  it('does not include the zebra stripe class when expanded', () => {
    expect(groupRowClassName(true, 1)).not.toContain('bg-black/[0.025]');
  });

  it('includes the zebra stripe class for odd indexes when not expanded', () => {
    expect(groupRowClassName(false, 1)).toContain('bg-black/[0.025]');
  });

  it('does not include the zebra stripe class for even indexes when not expanded', () => {
    expect(groupRowClassName(false, 0)).not.toContain('bg-black/[0.025]');
  });

  it('always includes the base border and hover classes', () => {
    const result = groupRowClassName(false, 0);
    expect(result).toContain('border-[var(--nav-border)]');
    expect(result).toContain('hover:bg-muted/20');
    expect(result).toContain('group');
  });
});

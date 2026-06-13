import { describe, it, expect } from 'vitest';
import { singleSelectTriggerClassName } from '.';

describe('singleSelectTriggerClassName', () => {
  it('returns the active styling when a value is selected', () => {
    expect(singleSelectTriggerClassName('a')).toContain('border-[var(--primary)]');
  });

  it('returns the inactive styling when nothing is selected', () => {
    const result = singleSelectTriggerClassName('');
    expect(result).toContain('border-[var(--border)]');
    expect(result).not.toContain('border-[var(--primary)]');
  });
});

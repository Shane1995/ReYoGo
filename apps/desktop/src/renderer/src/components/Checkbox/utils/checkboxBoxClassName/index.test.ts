import { describe, it, expect } from 'vitest';
import { checkboxBoxClassName } from '.';

describe('checkboxBoxClassName', () => {
  it('includes the disabled classes when disabled', () => {
    const cls = checkboxBoxClassName(true, false);
    expect(cls).toContain('cursor-not-allowed');
    expect(cls).toContain('opacity-40');
  });

  it('includes the pointer cursor class when not disabled', () => {
    const cls = checkboxBoxClassName(false, false);
    expect(cls).toContain('cursor-pointer');
  });

  it('includes active state classes when active', () => {
    const cls = checkboxBoxClassName(false, true);
    expect(cls).toContain('bg-[#20C997]');
    expect(cls).toContain('border-[#20C997]');
  });

  it('includes inactive state classes when not active', () => {
    const cls = checkboxBoxClassName(false, false);
    expect(cls).toContain('bg-transparent');
    expect(cls).toContain('border-input');
  });
});

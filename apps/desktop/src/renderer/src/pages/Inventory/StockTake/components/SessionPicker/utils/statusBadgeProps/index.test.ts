import { describe, it, expect } from 'vitest';
import { statusBadgeProps } from '.';

describe('statusBadgeProps', () => {
  it('returns Completed/secondary for a completed session', () => {
    expect(statusBadgeProps('complete')).toEqual({ variant: 'secondary', label: 'Completed' });
  });

  it('returns Open/outline for any other status', () => {
    expect(statusBadgeProps('open')).toEqual({ variant: 'outline', label: 'Open' });
  });
});

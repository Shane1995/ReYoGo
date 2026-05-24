import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { currentMonthRange } from '.';

describe('currentMonthRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns from as the first day of the current month', () => {
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'));
    const { from } = currentMonthRange();
    expect(from).toBe('2025-03-01');
  });

  it('returns to as the last day of the current month', () => {
    vi.setSystemTime(new Date('2025-03-15T12:00:00Z'));
    const { to } = currentMonthRange();
    expect(to).toBe('2025-03-31');
  });

  it('handles months with 28 days', () => {
    vi.setSystemTime(new Date('2025-02-10T12:00:00Z'));
    const { from, to } = currentMonthRange();
    expect(from).toBe('2025-02-01');
    expect(to).toBe('2025-02-28');
  });

  it('handles months with 30 days', () => {
    vi.setSystemTime(new Date('2025-04-10T12:00:00Z'));
    const { to } = currentMonthRange();
    expect(to).toBe('2025-04-30');
  });

  it('handles december correctly', () => {
    vi.setSystemTime(new Date('2025-12-20T12:00:00Z'));
    const { from, to } = currentMonthRange();
    expect(from).toBe('2025-12-01');
    expect(to).toBe('2025-12-31');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { toast } from 'sonner';
import { checkUnitName } from '.';
import type { UnitWithUsage } from '../../../../types';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const units: UnitWithUsage[] = [{ id: 'u1', name: 'Kilogram', usageCount: 0 }];

describe('checkUnitName', () => {
  it('returns ok: false for a blank name', () => {
    expect(checkUnitName(units, '   ')).toEqual({ ok: false });
  });

  it('returns ok: false and toasts for a duplicate name', () => {
    const result = checkUnitName(units, 'kilogram');
    expect(result).toEqual({ ok: false });
    expect(toast.error).toHaveBeenCalled();
  });

  it('allows a name matching the excluded id', () => {
    expect(checkUnitName(units, 'Kilogram', 'u1')).toEqual({ ok: true, name: 'Kilogram' });
  });

  it('returns the trimmed name when valid', () => {
    expect(checkUnitName(units, '  Litre  ')).toEqual({ ok: true, name: 'Litre' });
  });
});

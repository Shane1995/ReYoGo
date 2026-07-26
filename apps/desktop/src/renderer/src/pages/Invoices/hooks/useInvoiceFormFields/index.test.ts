import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import { useInvoiceFormFields } from './index';

describe('useInvoiceFormFields', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('pre-selects Tax on the first line of a brand new invoice, matching the default vatMode (Exclusive)', () => {
    const { result } = renderHook(() => useInvoiceFormFields(undefined, false, undefined, 'key-1'));
    expect(result.current.vatMode).toBe(VatMode.Exclusive);
    expect(result.current.lines[0]!.isVatable).toBe(true);
  });

  it('resetFields() reseeds a single line with Tax pre-selected, matching the vatMode it resets to', () => {
    const { result } = renderHook(() => useInvoiceFormFields(undefined, false, undefined, 'key-1'));

    act(() => {
      result.current.updateLine(result.current.lines[0]!.id, { isVatable: false, itemId: 'x' });
      result.current.addLine();
    });
    expect(result.current.lines).toHaveLength(2);

    act(() => {
      result.current.resetFields();
    });

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]!.isVatable).toBe(true);
  });
});

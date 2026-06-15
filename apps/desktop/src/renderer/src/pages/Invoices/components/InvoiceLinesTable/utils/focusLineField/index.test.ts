import { describe, it, expect, vi } from 'vitest';
import { focusLineField } from './index';
import type { ProcessReceiptLine } from '../../../../types';

function makeLine(id: string): ProcessReceiptLine {
  return { id, itemId: '', quantity: 0, isVatable: false, totalVatExclude: 0 };
}

describe('focusLineField', () => {
  it('focuses the field element for the line at the given index', () => {
    const line = makeLine('line-1');
    const el = document.createElement('input');
    el.id = 'invoice-qty-line-1';
    document.body.appendChild(el);
    const focusSpy = vi.spyOn(el, 'focus');

    focusLineField([line], 0, 'qty');

    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(el);
  });

  it('does nothing when there is no line at the given index', () => {
    expect(() => focusLineField([], 0, 'qty')).not.toThrow();
  });
});

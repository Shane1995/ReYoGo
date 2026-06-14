import { describe, it, expect, vi } from 'vitest';
import { focusLineItem } from './index';
import type { ProcessReceiptLine } from '../../../../types';

function makeLine(id: string): ProcessReceiptLine {
  return { id, itemId: '', quantity: 0, isVatable: false, totalVatExclude: 0 };
}

describe('focusLineItem', () => {
  it('focuses the item element for the line at the given index', () => {
    const line = makeLine('line-1');
    const el = document.createElement('input');
    el.id = 'invoice-item-line-1';
    document.body.appendChild(el);
    const focusSpy = vi.spyOn(el, 'focus');

    focusLineItem([line], 0);

    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(el);
  });

  it('does nothing when there is no line at the given index', () => {
    expect(() => focusLineItem([], 0)).not.toThrow();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFieldKeyDown } from './index';
import type { FieldKeyDownContext } from './types';

function makeContext(overrides: Partial<FieldKeyDownContext> = {}): FieldKeyDownContext {
  return {
    field: 'qty',
    lineId: 'line-1',
    confirmingDelete: false,
    isOnlyRow: false,
    isRowEmpty: false,
    onRemove: vi.fn(),
    onNavigateNext: vi.fn(),
    onNavigatePrev: vi.fn(),
    onNavigateToNextRowItem: vi.fn(),
    onAddLine: vi.fn(),
    setConfirmingDelete: vi.fn(),
    ...overrides,
  };
}

function makeEvent(
  key: string,
  { value = '', selectionStart = 0 }: { value?: string; selectionStart?: number | null } = {},
): React.KeyboardEvent<HTMLInputElement> {
  return {
    key,
    preventDefault: vi.fn(),
    currentTarget: { value, selectionStart },
  } as unknown as React.KeyboardEvent<HTMLInputElement>;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('handleFieldKeyDown', () => {
  describe('backspace on an empty field', () => {
    it('does nothing further when it is the only row', () => {
      const ctx = makeContext({ isOnlyRow: true, isRowEmpty: true });
      const e = makeEvent('Backspace', { value: '' });
      handleFieldKeyDown(e, ctx);
      expect(e.preventDefault).toHaveBeenCalled();
      expect(ctx.onRemove).not.toHaveBeenCalled();
      expect(ctx.setConfirmingDelete).not.toHaveBeenCalled();
    });

    it('removes the line directly when the row is empty', () => {
      const ctx = makeContext({ isOnlyRow: false, isRowEmpty: true });
      const e = makeEvent('Backspace', { value: '' });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onRemove).toHaveBeenCalledOnce();
    });

    it('asks for confirmation when the row has other content', () => {
      const ctx = makeContext({ isOnlyRow: false, isRowEmpty: false });
      const e = makeEvent('Backspace', { value: '' });
      handleFieldKeyDown(e, ctx);
      expect(ctx.setConfirmingDelete).toHaveBeenCalledWith(true);
    });
  });

  describe('when confirming delete', () => {
    it('Escape dismisses the confirmation', () => {
      const ctx = makeContext({ confirmingDelete: true });
      const e = makeEvent('Escape');
      handleFieldKeyDown(e, ctx);
      expect(ctx.setConfirmingDelete).toHaveBeenCalledWith(false);
      expect(ctx.onRemove).not.toHaveBeenCalled();
    });

    it('Enter confirms removal', () => {
      const ctx = makeContext({ confirmingDelete: true });
      const e = makeEvent('Enter');
      handleFieldKeyDown(e, ctx);
      expect(ctx.onRemove).toHaveBeenCalledOnce();
    });

    it('does not confirm removal on Backspace — only Enter and Escape are valid here, matching the on-screen hint', () => {
      const ctx = makeContext({ confirmingDelete: true });
      const e = makeEvent('Backspace', { value: '' });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onRemove).not.toHaveBeenCalled();
    });
  });

  describe('arrow navigation', () => {
    it('ArrowLeft at the start of qty focuses the item field', () => {
      const item = document.createElement('input');
      item.id = 'invoice-item-line-1';
      document.body.appendChild(item);
      const focusSpy = vi.spyOn(item, 'focus');

      const ctx = makeContext({ field: 'qty', lineId: 'line-1' });
      const e = makeEvent('ArrowLeft', { value: '5', selectionStart: 0 });
      handleFieldKeyDown(e, ctx);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('ArrowLeft at the start of total focuses the qty field', () => {
      const qty = document.createElement('input');
      qty.id = 'invoice-qty-line-1';
      document.body.appendChild(qty);
      const focusSpy = vi.spyOn(qty, 'focus');

      const ctx = makeContext({ field: 'total', lineId: 'line-1' });
      const e = makeEvent('ArrowLeft', { value: '5', selectionStart: 0 });
      handleFieldKeyDown(e, ctx);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('ArrowRight at the end of qty focuses the total field', () => {
      const total = document.createElement('input');
      total.id = 'invoice-total-line-1';
      document.body.appendChild(total);
      const focusSpy = vi.spyOn(total, 'focus');

      const ctx = makeContext({ field: 'qty', lineId: 'line-1' });
      const e = makeEvent('ArrowRight', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('ArrowRight at the end of total navigates to the next row item', () => {
      const ctx = makeContext({ field: 'total', lineId: 'line-1' });
      const e = makeEvent('ArrowRight', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onNavigateToNextRowItem).toHaveBeenCalledOnce();
    });

    it('does not navigate when the cursor is not at the field edge', () => {
      const ctx = makeContext({ field: 'qty', lineId: 'line-1' });
      const e = makeEvent('ArrowRight', { value: '55', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('vertical navigation', () => {
    it('Enter moves to the next row', () => {
      const ctx = makeContext({ field: 'qty' });
      const e = makeEvent('Enter', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onNavigateNext).toHaveBeenCalledWith('qty');
    });

    it('ArrowDown moves to the next row', () => {
      const ctx = makeContext({ field: 'qty' });
      const e = makeEvent('ArrowDown', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onNavigateNext).toHaveBeenCalledWith('qty');
    });

    it('ArrowUp moves to the previous row', () => {
      const ctx = makeContext({ field: 'total' });
      const e = makeEvent('ArrowUp', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onNavigatePrev).toHaveBeenCalledWith('total');
    });
  });

  describe('tab navigation', () => {
    it('Tab from qty focuses the total field', () => {
      const total = document.createElement('input');
      total.id = 'invoice-total-line-1';
      document.body.appendChild(total);
      const focusSpy = vi.spyOn(total, 'focus');

      const ctx = makeContext({ field: 'qty', lineId: 'line-1' });
      const e = makeEvent('Tab', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);

      expect(focusSpy).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('Tab from total adds a new line', () => {
      const ctx = makeContext({ field: 'total', lineId: 'line-1' });
      const e = makeEvent('Tab', { value: '5', selectionStart: 1 });
      handleFieldKeyDown(e, ctx);
      expect(ctx.onAddLine).toHaveBeenCalledOnce();
    });
  });
});

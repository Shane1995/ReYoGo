import type { FieldKeyDownContext } from './types';

export type { FieldKeyDownContext } from './types';

function isConfirmingDeleteDismissKey(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  return e.key === 'Escape';
}

function isConfirmingDeleteAcceptKey(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  return e.key === 'Enter';
}

function handleConfirmingDeleteKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  ctx: FieldKeyDownContext,
): boolean {
  if (isConfirmingDeleteDismissKey(e)) {
    e.preventDefault();
    ctx.setConfirmingDelete(false);
    return true;
  }
  if (isConfirmingDeleteAcceptKey(e)) {
    e.preventDefault();
    ctx.onRemove();
    return true;
  }
  return false;
}

function handleEmptyBackspace(
  e: React.KeyboardEvent<HTMLInputElement>,
  ctx: FieldKeyDownContext,
): boolean {
  if (e.key !== 'Backspace') return false;
  e.preventDefault();
  if (ctx.isOnlyRow) return true;
  if (ctx.isRowEmpty) {
    ctx.onRemove();
  } else {
    ctx.setConfirmingDelete(true);
  }
  return true;
}

function handleBackspaceKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  val: string,
  ctx: FieldKeyDownContext,
): boolean {
  if (ctx.confirmingDelete) return handleConfirmingDeleteKey(e, ctx);
  if (val === '') return handleEmptyBackspace(e, ctx);
  return false;
}

function isAtFieldEdge(pos: number | null, edge: 'start' | 'end', valLength: number): boolean {
  if (pos === null) return true;
  return edge === 'start' ? pos === 0 : pos === valLength;
}

function focusFieldById(id: string): void {
  document.getElementById(id)?.focus();
}

function handleArrowLeft(pos: number | null, field: 'qty' | 'total', lineId: string): boolean {
  if (!isAtFieldEdge(pos, 'start', 0)) return false;
  const prevId = field === 'qty' ? `invoice-item-${lineId}` : `invoice-qty-${lineId}`;
  focusFieldById(prevId);
  return true;
}

function handleArrowRight(
  pos: number | null,
  val: string,
  field: 'qty' | 'total',
  lineId: string,
  ctx: FieldKeyDownContext,
): boolean {
  if (!isAtFieldEdge(pos, 'end', val.length)) return false;
  if (field === 'qty') {
    focusFieldById(`invoice-total-${lineId}`);
  } else {
    ctx.onNavigateToNextRowItem();
  }
  return true;
}

function handleArrowNavigation(
  e: React.KeyboardEvent<HTMLInputElement>,
  val: string,
  pos: number | null,
  field: 'qty' | 'total',
  lineId: string,
  ctx: FieldKeyDownContext,
): boolean {
  let handled = false;
  if (e.key === 'ArrowLeft') {
    handled = handleArrowLeft(pos, field, lineId);
  } else if (e.key === 'ArrowRight') {
    handled = handleArrowRight(pos, val, field, lineId, ctx);
  }

  if (handled) e.preventDefault();
  return handled;
}

function handleVerticalNavigation(
  e: React.KeyboardEvent<HTMLInputElement>,
  ctx: FieldKeyDownContext,
): boolean {
  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault();
    ctx.onNavigateNext(ctx.field);
    return true;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    ctx.onNavigatePrev(ctx.field);
    return true;
  }
  return false;
}

function handleTabKey(e: React.KeyboardEvent<HTMLInputElement>, ctx: FieldKeyDownContext): void {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  if (ctx.field === 'qty') {
    document.getElementById(`invoice-total-${ctx.lineId}`)?.focus();
  } else {
    ctx.onAddLine();
  }
}

export function handleFieldKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  ctx: FieldKeyDownContext,
): void {
  const val = e.currentTarget.value;
  const pos = e.currentTarget.selectionStart;

  if (handleBackspaceKey(e, val, ctx)) return;
  if (handleArrowNavigation(e, val, pos, ctx.field, ctx.lineId, ctx)) return;
  if (handleVerticalNavigation(e, ctx)) return;
  handleTabKey(e, ctx);
}

import { useRef, useState } from 'react';
import type { ProcessReceiptLine } from '../../../types';
import { getProcessLineComputed } from '../../../types';
import type { FieldKeyDownContext } from '../utils/handleFieldKeyDown';
import type { UseLineRowStateParams } from './types';

function isLineEmpty(line: ProcessReceiptLine): boolean {
  return !line.itemId && !line.quantity && !line.totalVatExclude;
}

function shouldResetConfirmingDelete(
  e: React.FocusEvent,
  rowRef: React.RefObject<HTMLTableRowElement | null>,
): boolean {
  const relatedTarget = e.relatedTarget instanceof Node ? e.relatedTarget : null;
  return !rowRef.current?.contains(relatedTarget);
}

export function useLineRowState(params: UseLineRowStateParams) {
  const { line, index, isLast, isExpanded, vatMode, vatRate } = params;

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const computed = getProcessLineComputed(line, vatMode, vatRate);
  const isRowEmpty = isLineEmpty(line);
  const isOnlyRow = index === 0 && isLast;

  const keyDownCtx: Omit<FieldKeyDownContext, 'field'> = {
    lineId: line.id,
    confirmingDelete,
    isOnlyRow,
    isRowEmpty,
    onRemove: params.onRemove,
    onNavigateNext: params.onNavigateNext,
    onNavigatePrev: params.onNavigatePrev,
    onNavigateToNextRowItem: params.onNavigateToNextRowItem,
    onAddLine: params.onAddLine,
    setConfirmingDelete,
  };

  function handleBlurRow(e: React.FocusEvent) {
    if (!confirmingDelete) return;
    if (shouldResetConfirmingDelete(e, rowRef)) setConfirmingDelete(false);
  }

  return { confirmingDelete, rowRef, computed, keyDownCtx, handleBlurRow, isExpanded };
}

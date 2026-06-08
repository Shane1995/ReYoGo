import { Fragment, useRef, useState } from 'react';
import { TableRow, cn } from '@reyogo/ui';
import { type ItemOption } from '../ItemAutocomplete';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed } from '../../types';
import { type ItemMeta } from './ItemMetaHint';
import { ExpandToggleCell } from './ExpandToggleCell';
import { LineDetailRow } from './LineDetailRow';
import { LineItemCell } from './LineItemCell';
import { LineNumberCell } from './LineNumberCell';
import { RemoveLineCell } from './RemoveLineCell';
import { VatToggleCell } from './VatToggleCell';
import type { FieldKeyDownContext } from './handleFieldKeyDown';

type Props = {
  line: ProcessReceiptLine;
  index: number;
  vatMode: VatMode;
  vatRate: number;
  isExpanded: boolean;
  isLast: boolean;
  sortedItems: ItemOption[];
  entityId: string;
  itemMeta: ItemMeta | undefined;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ProcessReceiptLine>) => void;
  onRemove: () => void;
  onAddLine: (focusField?: string) => void;
  onNavigateNext: (field: string) => void;
  onNavigatePrev: (field: string) => void;
  onNavigateToNextRowItem: () => void;
};

function isLineEmpty(line: ProcessReceiptLine): boolean {
  return !line.itemId && !line.quantity && !line.totalVatExclude;
}

function shouldResetConfirmingDelete(
  e: React.FocusEvent,
  rowRef: React.RefObject<HTMLTableRowElement | null>,
): boolean {
  return !rowRef.current?.contains(e.relatedTarget as Node);
}

function rowBackgroundClass(confirmingDelete: boolean, isExpanded: boolean): string {
  if (confirmingDelete) return 'bg-destructive/5';
  if (isExpanded) return 'bg-[var(--nav-accent)]/30';
  return 'hover:bg-muted/20';
}

function rowClassName(confirmingDelete: boolean, isExpanded: boolean, index: number): string {
  const isAlternateRow = !isExpanded && !confirmingDelete && index % 2 !== 0;
  return cn(
    'animate-in fade-in slide-in-from-bottom-1 duration-150',
    'border-[var(--nav-border)] transition-colors group',
    rowBackgroundClass(confirmingDelete, isExpanded),
    isAlternateRow && 'bg-black/[0.025]',
  );
}

export function InvoiceLineRow({
  line,
  index,
  vatMode,
  vatRate,
  isExpanded,
  isLast,
  sortedItems,
  entityId,
  itemMeta,
  onToggleExpand,
  onUpdate,
  onRemove,
  onAddLine,
  onNavigateNext,
  onNavigatePrev,
  onNavigateToNextRowItem,
}: Props) {
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
    onRemove,
    onNavigateNext,
    onNavigatePrev,
    onNavigateToNextRowItem,
    onAddLine,
    setConfirmingDelete,
  };

  function handleBlurRow(e: React.FocusEvent) {
    if (!confirmingDelete) return;
    if (shouldResetConfirmingDelete(e, rowRef)) setConfirmingDelete(false);
  }

  return (
    <Fragment>
      <TableRow ref={rowRef} className={rowClassName(confirmingDelete, isExpanded, index)}>
        <ExpandToggleCell isExpanded={isExpanded} onToggle={onToggleExpand} />

        <LineItemCell
          lineId={line.id}
          itemId={line.itemId}
          sortedItems={sortedItems}
          entityId={entityId}
          isLast={isLast}
          itemMeta={itemMeta}
          vatMode={vatMode}
          computed={computed}
          onChange={(itemId) => onUpdate({ itemId })}
          onAddLine={onAddLine}
        />

        <LineNumberCell
          field="qty"
          lineId={line.id}
          value={line.quantity}
          onChange={(quantity) => onUpdate({ quantity })}
          onBlur={handleBlurRow}
          keyDownCtx={keyDownCtx}
        />

        <VatToggleCell
          lineId={line.id}
          isVatable={line.isVatable}
          onToggle={() => onUpdate({ isVatable: !line.isVatable })}
        />

        <LineNumberCell
          field="total"
          lineId={line.id}
          value={line.totalVatExclude}
          onChange={(totalVatExclude) => onUpdate({ totalVatExclude })}
          onBlur={handleBlurRow}
          keyDownCtx={keyDownCtx}
        />

        <RemoveLineCell confirmingDelete={confirmingDelete} onRemove={onRemove} />
      </TableRow>

      {isExpanded && <LineDetailRow computed={computed} />}
    </Fragment>
  );
}

import { Fragment } from 'react';
import { TableRow, cn } from '@reyogo/ui';
import { ExpandToggleCell } from './ExpandToggleCell';
import { LineDetailRow } from './LineDetailRow';
import { LineItemCell } from './LineItemCell';
import { LineNumberCell } from './LineNumberCell';
import { RemoveLineCell } from './RemoveLineCell';
import { VatToggleCell } from './VatToggleCell';
import { useLineRowState } from './useLineRowState';
import { lineNeedsReview } from '../../utils/lineNeedsReview';
import type { InvoiceLineRowProps } from './types';

function rowBackgroundClass(confirmingDelete: boolean, isExpanded: boolean): string {
  if (confirmingDelete) return 'bg-destructive/5';
  if (isExpanded) return 'bg-[var(--nav-accent)]/30';
  return 'hover:bg-muted/20';
}

function isAlternateRow(confirmingDelete: boolean, isExpanded: boolean, index: number): boolean {
  return !isExpanded && !confirmingDelete && index % 2 !== 0;
}

function rowClassName(
  confirmingDelete: boolean,
  isExpanded: boolean,
  needsReview: boolean,
  index: number,
): string {
  return cn(
    'animate-in fade-in slide-in-from-bottom-1 duration-150',
    'border-[var(--nav-border)] transition-colors group',
    needsReview && 'border-l-2 border-l-amber-500',
    rowBackgroundClass(confirmingDelete, isExpanded),
    isAlternateRow(confirmingDelete, isExpanded, index) && 'bg-black/[0.025]',
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
}: InvoiceLineRowProps) {
  const { confirmingDelete, rowRef, computed, keyDownCtx, handleBlurRow } = useLineRowState({
    line,
    index,
    isLast,
    isExpanded,
    vatMode,
    vatRate,
    onRemove,
    onAddLine,
    onNavigateNext,
    onNavigatePrev,
    onNavigateToNextRowItem,
  });

  return (
    <Fragment>
      <TableRow
        ref={rowRef}
        className={rowClassName(confirmingDelete, isExpanded, lineNeedsReview(line), index)}
      >
        <ExpandToggleCell isExpanded={isExpanded} onToggle={onToggleExpand} />

        <LineItemCell
          lineId={line.id}
          itemId={line.itemId}
          needsReview={!!line.needsReview}
          sortedItems={sortedItems}
          entityId={entityId}
          isLast={isLast}
          itemMeta={itemMeta}
          vatMode={vatMode}
          computed={computed}
          onChange={(itemId) => onUpdate({ itemId, needsReview: false })}
          onAddLine={onAddLine}
        />

        <LineNumberCell
          field="qty"
          lineId={line.id}
          value={line.quantity}
          needsReview={!!line.quantityNeedsReview}
          reviewMessage="AI wasn’t confident reading this quantity"
          onChange={(quantity) => onUpdate({ quantity, quantityNeedsReview: false })}
          onBlur={handleBlurRow}
          keyDownCtx={keyDownCtx}
        />

        <VatToggleCell
          lineId={line.id}
          isVatable={line.isVatable}
          needsReview={!!line.taxNeedsReview}
          onToggle={() => onUpdate({ isVatable: !line.isVatable, taxNeedsReview: false })}
        />

        <LineNumberCell
          field="total"
          lineId={line.id}
          value={line.totalVatExclude}
          needsReview={!!line.totalNeedsReview}
          reviewMessage="AI wasn’t confident reading this price"
          onChange={(totalVatExclude) => onUpdate({ totalVatExclude, totalNeedsReview: false })}
          onBlur={handleBlurRow}
          keyDownCtx={keyDownCtx}
        />

        <RemoveLineCell confirmingDelete={confirmingDelete} onRemove={onRemove} />
      </TableRow>

      {isExpanded && <LineDetailRow computed={computed} />}
    </Fragment>
  );
}

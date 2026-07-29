import { TableCell } from '@reyogo/ui';
import { ItemAutocomplete } from '../../ItemAutocomplete';
import { ItemMetaHint } from '../ItemMetaHint';
import { FieldReviewIcon } from '../components/FieldReviewIcon';
import type { LineItemCellProps } from './types';

function focusQtyField(lineId: string): void {
  document.getElementById(`invoice-qty-${lineId}`)?.focus();
}

function handleItemSelectComplete(
  lineId: string,
  isLast: boolean,
  onAddLine: (focusField?: string) => void,
): void {
  focusQtyField(lineId);
  if (isLast) onAddLine();
}

function itemInputClassName(needsReview: boolean): string | undefined {
  return needsReview ? 'pr-7 ring-1 ring-amber-500 focus-visible:ring-amber-500' : undefined;
}

export function LineItemCell({
  lineId,
  itemId,
  needsReview,
  sortedItems,
  entityId,
  isLast,
  itemMeta,
  vatMode,
  computed,
  onChange,
  onAddLine,
}: LineItemCellProps) {
  return (
    <TableCell className="py-2 px-3">
      <div className="relative">
        <ItemAutocomplete
          inputId={`invoice-item-${lineId}`}
          items={sortedItems}
          value={itemId}
          onChange={onChange}
          entityId={entityId}
          placeholder="Search item…"
          inputClassName={itemInputClassName(needsReview)}
          onSelectComplete={() => handleItemSelectComplete(lineId, isLast, onAddLine)}
          onNavigateRight={() => focusQtyField(lineId)}
        />
        {needsReview && (
          <FieldReviewIcon
            message="AI couldn’t confidently match this item — please pick the right one"
            className="right-2"
          />
        )}
      </div>
      {itemId && itemMeta && (
        <ItemMetaHint itemMeta={itemMeta} vatMode={vatMode} computed={computed} />
      )}
    </TableCell>
  );
}

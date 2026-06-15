import { TableCell } from '@reyogo/ui';
import { ItemAutocomplete } from '../../ItemAutocomplete';
import { ItemMetaHint } from '../ItemMetaHint';
import type { LineItemCellProps } from './types';

export function LineItemCell({
  lineId,
  itemId,
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
      <ItemAutocomplete
        inputId={`invoice-item-${lineId}`}
        items={sortedItems}
        value={itemId}
        onChange={onChange}
        entityId={entityId}
        placeholder="Search item…"
        onSelectComplete={() => {
          document.getElementById(`invoice-qty-${lineId}`)?.focus();
          if (isLast) onAddLine();
        }}
        onNavigateRight={() => document.getElementById(`invoice-qty-${lineId}`)?.focus()}
      />
      {itemId && itemMeta && (
        <ItemMetaHint itemMeta={itemMeta} vatMode={vatMode} computed={computed} />
      )}
    </TableCell>
  );
}

import { TableCell } from '@reyogo/ui';
import { ItemAutocomplete, type ItemOption } from '../../ItemAutocomplete';
import { VatMode } from '@reyogo/types';
import type { getProcessLineComputed } from '../../../types';
import { ItemMetaHint, type ItemMeta } from '../ItemMetaHint';

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
}: {
  lineId: string;
  itemId: string;
  sortedItems: ItemOption[];
  entityId: string;
  isLast: boolean;
  itemMeta: ItemMeta | undefined;
  vatMode: VatMode;
  computed: ReturnType<typeof getProcessLineComputed>;
  onChange: (itemId: string) => void;
  onAddLine: (focusField?: string) => void;
}) {
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

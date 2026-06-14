import { InvoiceLinesTable } from '../InvoiceLinesTable';
import type { InvoiceBodyProps } from './types';

export function InvoiceBody({ form, sortedItems }: InvoiceBodyProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="mx-4 my-4">
        <InvoiceLinesTable
          lines={form.lines}
          vatMode={form.vatMode}
          vatRate={form.selectedEntity?.defaultVatRate ?? 0}
          expandedLineIds={form.expandedResultLineIds}
          sortedItems={sortedItems}
          entityId={form.entityId}
          itemMetaMap={form.itemMetaMap}
          onToggleExpand={form.toggleResultRow}
          onUpdateLine={form.updateLine}
          onRemoveLine={form.removeLine}
          onAddLine={form.addLine}
        />
      </div>
    </div>
  );
}

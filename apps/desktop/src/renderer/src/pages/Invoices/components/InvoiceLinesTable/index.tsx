import { PlusIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { InvoiceLineRow } from '../InvoiceLineRow';
import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import type { ItemOption } from '../ItemAutocomplete';

function focusLineField(lines: ProcessReceiptLine[], index: number, field: string): void {
  const line = lines[index];
  if (line) document.getElementById(`invoice-${field}-${line.id}`)?.focus();
}

function focusLineItem(lines: ProcessReceiptLine[], index: number): void {
  const line = lines[index];
  if (line) document.getElementById(`invoice-item-${line.id}`)?.focus();
}

const thCls = 'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5';

function LinesTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-[var(--nav-border)] hover:bg-transparent bg-muted/30">
        <TableHead className="w-8 p-2" />
        <TableHead className={thCls}>Item</TableHead>
        <TableHead className={`${thCls} w-24`}>Qty</TableHead>
        <TableHead className={`${thCls} w-20 text-center`}>Tax</TableHead>
        <TableHead className={`${thCls} w-32`}>Total (excl.)</TableHead>
        <TableHead className="w-12" />
      </TableRow>
    </TableHeader>
  );
}

type ItemMeta = {
  categoryName?: string;
  typeLabel?: string;
  unitOfMeasure?: string | null;
  lastUnitCostInclVat?: number;
};

type Props = {
  lines: ProcessReceiptLine[];
  vatMode: VatMode;
  vatRate: number;
  expandedLineIds: Set<string>;
  sortedItems: ItemOption[];
  entityId: string;
  itemMetaMap: Map<string, ItemMeta>;
  onToggleExpand: (lineId: string) => void;
  onUpdateLine: (lineId: string, updates: Partial<ProcessReceiptLine>) => void;
  onRemoveLine: (lineId: string) => void;
  onAddLine: (focusField?: string) => void;
};

export function InvoiceLinesTable({
  lines,
  vatMode,
  vatRate,
  expandedLineIds,
  sortedItems,
  entityId,
  itemMetaMap,
  onToggleExpand,
  onUpdateLine,
  onRemoveLine,
  onAddLine,
}: Props) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
      <Table>
        <LinesTableHeader />
        <TableBody>
          {lines.map((line, i) => (
            <InvoiceLineRow
              key={line.id}
              line={line}
              index={i}
              vatMode={vatMode}
              vatRate={vatRate}
              isExpanded={expandedLineIds.has(line.id)}
              isLast={i === lines.length - 1}
              sortedItems={sortedItems}
              entityId={entityId}
              itemMeta={itemMetaMap.get(line.itemId)}
              onToggleExpand={() => onToggleExpand(line.id)}
              onUpdate={(updates) => onUpdateLine(line.id, updates)}
              onRemove={() => onRemoveLine(line.id)}
              onAddLine={onAddLine}
              onNavigateNext={(field) => {
                if (lines[i + 1]) focusLineField(lines, i + 1, field);
                else onAddLine(field);
              }}
              onNavigatePrev={(field) => focusLineField(lines, i - 1, field)}
              onNavigateToNextRowItem={() => focusLineItem(lines, i + 1)}
            />
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-start border-t border-[var(--nav-border)] bg-muted/10 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onAddLine()}
          className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
        >
          <PlusIcon className="size-3.5" aria-hidden />
          Add line
        </Button>
      </div>
    </div>
  );
}

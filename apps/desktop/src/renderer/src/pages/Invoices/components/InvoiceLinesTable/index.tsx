import { PlusIcon } from 'lucide-react';
import { Button, Table, TableBody } from '@reyogo/ui';
import { InvoiceLineRow } from '../InvoiceLineRow';
import { LinesTableHeader } from './components/LinesTableHeader';
import { focusLineField } from './utils/focusLineField';
import { focusLineItem } from './utils/focusLineItem';
import type { InvoiceLinesTableProps } from './types';

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
}: InvoiceLinesTableProps) {
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

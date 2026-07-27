import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { toggleSetMember } from '@/pages/Inventory/Analysis/utils/toggleSetMember';
import { groupRowsByItem } from './utils/groupRowsByItem';
import { ItemGroupRow } from './components/ItemGroupRow';
import type { ItemCostHistoryTableProps } from './types';

export function ItemCostHistoryTable({ rows }: ItemCostHistoryTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No purchases for the selected range or category.
      </div>
    );
  }

  const groups = groupRowsByItem(rows);
  const toggle = (itemId: string) => setExpanded((prev) => toggleSetMember(prev, itemId));

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
            <TableHead className="w-10" />
            <TableHead>Item</TableHead>
            <TableHead>Last purchased</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Excl. VAT</TableHead>
            <TableHead className="text-right">Incl. VAT</TableHead>
            <TableHead className="text-center">Taxable</TableHead>
            <TableHead className="text-right">% Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, index) => (
            <ItemGroupRow
              key={group.itemId}
              group={group}
              index={index}
              isExpanded={expanded.has(group.itemId)}
              onToggle={toggle}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

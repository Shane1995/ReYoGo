import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@reyogo/ui';
import { formatZAR } from '@/utils/format';
import { toggleSetMember } from '@/pages/Inventory/Analysis/utils/toggleSetMember';
import { groupByCategory } from '../../utils/groupByCategory';
import { grandItemTotalOf } from '../../utils/grandItemTotalOf';
import { CategoryGroup } from '../CategoryGroup';
import type { ItemTotalsTableProps } from './types';

export function ItemTotalsTable({ rows, grandTotal, emptyMessage }: ItemTotalsTableProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        {emptyMessage}
      </div>
    );
  }

  const toggleCategory = (category: string) =>
    setCollapsedCategories((prev) => toggleSetMember(prev, category));
  const buckets = groupByCategory(rows, (row) => row.categoryName);

  return (
    <div className="space-y-3">
      {buckets.map((bucket) => (
        <CategoryGroup
          key={bucket.category}
          category={bucket.category}
          count={bucket.rows.length}
          summary={formatZAR(grandItemTotalOf(bucket.rows))}
          isExpanded={!collapsedCategories.has(bucket.category)}
          onToggle={toggleCategory}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
                <TableHead>Item</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bucket.rows.map((row) => (
                <TableRow key={row.itemId}>
                  <TableCell className="py-2.5 font-medium text-foreground">
                    {row.itemName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.uom ?? '—'}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{row.qty}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums font-medium">
                    {formatZAR(row.totalValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CategoryGroup>
      ))}
      <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
        <Table>
          <TableFooter>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableCell colSpan={3} className="text-right font-semibold">
                Grand Total
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums font-semibold">
                {formatZAR(grandTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

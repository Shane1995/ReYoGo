import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { formatZAR } from '@/utils/format';
import { useCollapsedCategories } from '../../hooks/useCollapsedCategories';
import { groupByCategory } from '../../utils/groupByCategory';
import { grandItemTotalOf } from '../../utils/grandItemTotalOf';
import { CategoryGroup } from '../CategoryGroup';
import { GrandTotalFooter } from '../GrandTotalFooter';
import type { ItemTotalsTableProps } from './types';

export function ItemTotalsTable({ rows, grandTotal, emptyMessage }: ItemTotalsTableProps) {
  const { isExpanded, toggleCategory } = useCollapsedCategories();

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        {emptyMessage}
      </div>
    );
  }

  const buckets = groupByCategory(rows, (row) => row.categoryName);

  return (
    <div className="space-y-3">
      {buckets.map((bucket) => (
        <CategoryGroup
          key={bucket.category}
          category={bucket.category}
          count={bucket.rows.length}
          summary={formatZAR(grandItemTotalOf(bucket.rows))}
          isExpanded={isExpanded(bucket.category)}
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
      <GrandTotalFooter colSpan={3} total={grandTotal} />
    </div>
  );
}

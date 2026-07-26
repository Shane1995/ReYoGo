import { Fragment } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { TableCell, TableRow, Badge } from '@reyogo/ui';
import { fmt, fmtDate } from '@/pages/Inventory/Analysis/utils/format';
import { changeCls } from '@/pages/Inventory/Analysis/utils/styles';
import { chevronClassName } from '@/pages/Inventory/Analysis/components/TableView/components/GroupRow/utils/chevronClassName';
import { groupRowClassName } from '@/pages/Inventory/Analysis/components/TableView/components/GroupRow/utils/groupRowClassName';
import { overallPctChangeOf } from './utils/overallPctChangeOf';
import { ExpandedPurchasesRow } from '../ExpandedPurchasesRow';
import type { ItemGroupRowProps } from './types';

export function ItemGroupRow({ group, index, isExpanded, onToggle }: ItemGroupRowProps) {
  const last = group.rows[group.rows.length - 1];
  if (!last) return null;
  const change = overallPctChangeOf(group.rows);

  return (
    <Fragment>
      <TableRow className={groupRowClassName(isExpanded, index)}>
        <TableCell
          className="w-10 cursor-pointer text-center"
          onClick={() => onToggle(group.itemId)}
        >
          <ChevronRightIcon className={chevronClassName(isExpanded)} />
        </TableCell>
        <TableCell
          className="py-2.5 font-medium text-foreground cursor-pointer"
          onClick={() => onToggle(group.itemId)}
        >
          {group.itemName}
          {group.uom ? <span className="text-muted-foreground/60"> / {group.uom}</span> : null}
        </TableCell>
        <TableCell className="py-2.5 text-sm text-muted-foreground">{fmtDate(last.date)}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{last.quantity}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {fmt(last.unitCostExclVat)}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {fmt(last.unitCostInclVat)}
        </TableCell>
        <TableCell className="text-center">
          {last.isVatable ? (
            <span className="text-[var(--nav-active-border)]">✓</span>
          ) : (
            <span className="text-muted-foreground/30">—</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className={changeCls(change)}>
              {change === null ? '—' : `${change.toFixed(1)}%`}
            </span>
            {group.flagged && <Badge variant="destructive">Jump</Badge>}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && <ExpandedPurchasesRow rows={group.rows} />}
    </Fragment>
  );
}

import { Fragment } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { TableCell, TableRow } from '@reyogo/ui';
import { fmtDate } from '@/pages/Inventory/Analysis/utils/format';
import { formatZAR } from '@/utils/format';
import { chevronClassName } from '@/pages/Inventory/Analysis/components/TableView/components/GroupRow/utils/chevronClassName';
import { groupRowClassName } from '@/pages/Inventory/Analysis/components/TableView/components/GroupRow/utils/groupRowClassName';
import { overallPctChangeOf } from './utils/overallPctChangeOf';
import { ExpandedPurchasesRow } from '../ExpandedPurchasesRow';
import { ItemNameCell } from './components/ItemNameCell';
import { TaxableCell } from './components/TaxableCell';
import { ChangeCell } from './components/ChangeCell';
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
          <ItemNameCell name={group.itemName} uom={group.uom} />
        </TableCell>
        <TableCell className="py-2.5 text-sm text-muted-foreground">{fmtDate(last.date)}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{last.quantity}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {formatZAR(last.unitCostExclVat)}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {formatZAR(last.unitCostInclVat)}
        </TableCell>
        <TableCell className="text-center">
          <TaxableCell isVatable={last.isVatable} />
        </TableCell>
        <TableCell className="text-right">
          <ChangeCell change={change} flagged={group.flagged} />
        </TableCell>
      </TableRow>
      {isExpanded && <ExpandedPurchasesRow rows={group.rows} />}
    </Fragment>
  );
}

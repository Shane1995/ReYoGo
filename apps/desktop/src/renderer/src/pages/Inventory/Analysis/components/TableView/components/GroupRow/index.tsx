import { Fragment } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { TableCell, TableRow } from '@reyogo/ui';
import { fmtDate } from '../../../../utils/format';
import { overallChangePct } from '../../../../utils/stats';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { PriceCell } from '../PriceCell';
import { ChangeCell } from '../ChangeCell';
import { ExpandedRow } from '../ExpandedRow';
import { groupRowClassName } from './utils/groupRowClassName';
import { chevronClassName } from './utils/chevronClassName';
import type { GroupRowProps } from './types';

export function GroupRow({ group, index, expanded, toggle, navigate }: GroupRowProps) {
  const last = group.entries[group.entries.length - 1];
  if (!last) return null;
  const change = overallChangePct(group);
  const isExpanded = expanded.has(group.itemId);
  return (
    <Fragment>
      <TableRow className={groupRowClassName(isExpanded, index)}>
        <TableCell className="w-10 cursor-pointer text-center" onClick={() => toggle(group.itemId)}>
          <ChevronRightIcon className={chevronClassName(isExpanded)} />
        </TableCell>
        <TableCell
          className="py-2.5 font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(itemTrendPath(group.itemId))}
        >
          {group.name}
        </TableCell>
        <TableCell className="py-2.5 text-sm text-muted-foreground">{fmtDate(last.date)}</TableCell>
        <PriceCell last={last} />
        <ChangeCell change={change} />
      </TableRow>
      {isExpanded && <ExpandedRow group={group} />}
    </Fragment>
  );
}

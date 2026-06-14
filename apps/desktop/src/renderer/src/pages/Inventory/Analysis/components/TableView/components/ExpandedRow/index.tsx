import { TableCell, TableRow } from '@reyogo/ui';
import { ExpandedEntries } from '../ExpandedEntries';
import type { ExpandedRowProps } from './types';

export function ExpandedRow({ group }: ExpandedRowProps) {
  return (
    <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
      <TableCell />
      <TableCell colSpan={4} className="py-3 bg-[var(--nav-accent)]/20">
        <ExpandedEntries entries={group.entries} />
      </TableCell>
    </TableRow>
  );
}

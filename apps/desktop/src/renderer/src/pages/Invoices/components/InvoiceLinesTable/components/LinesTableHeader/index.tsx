import { TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { TH_CLASS } from './constants';
import { totalColumnLabelOf } from './utils/totalColumnLabelOf';
import type { LinesTableHeaderProps } from './types';

export function LinesTableHeader({ vatMode }: LinesTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="border-[var(--nav-border)] hover:bg-transparent bg-muted/30">
        <TableHead className="w-8 p-2" />
        <TableHead className={TH_CLASS}>Item</TableHead>
        <TableHead className={`${TH_CLASS} w-24`}>Qty</TableHead>
        <TableHead className={`${TH_CLASS} w-20 text-center`}>Tax</TableHead>
        <TableHead className={`${TH_CLASS} w-32`}>{totalColumnLabelOf(vatMode)}</TableHead>
        <TableHead className="w-12" />
      </TableRow>
    </TableHeader>
  );
}

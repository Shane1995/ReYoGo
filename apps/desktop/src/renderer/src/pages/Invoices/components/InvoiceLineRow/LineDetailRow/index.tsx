import { TableCell, TableRow } from '@reyogo/ui';
import type { getProcessLineComputed } from '../../../types';
import { formatMoney } from '../../../utils/formatMoney';

export function LineDetailRow({
  computed,
}: {
  computed: ReturnType<typeof getProcessLineComputed>;
}) {
  const fields = [
    { label: 'Net unit', value: computed.netUnitPrice },
    { label: 'Gross unit', value: computed.grossUnitPrice },
    { label: 'Net total', value: computed.netTotal },
    { label: 'Gross total', value: computed.grossTotal },
  ];

  return (
    <TableRow className="border-[var(--nav-border)] bg-[var(--nav-accent)]/20">
      <TableCell colSpan={7} className="py-2.5 pl-10 pr-4 align-top">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:flex sm:flex-wrap sm:gap-x-8">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
                {label}
              </span>
              <span className="font-mono text-sm text-foreground tabular-nums">
                {formatMoney(value)}
              </span>
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}

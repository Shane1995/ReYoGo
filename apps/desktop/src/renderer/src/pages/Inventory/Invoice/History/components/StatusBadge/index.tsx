import { CheckCircleIcon } from 'lucide-react';
import { InvoiceStatus } from '@reyogo/types';

type Props = { status: InvoiceStatus };

export function StatusBadge({ status }: Props) {
  if (status === InvoiceStatus.Posted) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircleIcon className="size-3" />
        Posted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
      <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
      Draft
    </span>
  );
}

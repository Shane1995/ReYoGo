import { CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import { SummaryCard } from '../SummaryCard';

export function SummaryCards({
  selectedNew,
  existsCount,
  unresolvedCount,
}: {
  selectedNew: number;
  existsCount: number;
  unresolvedCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <SummaryCard
        icon={<CheckCircle2Icon className="size-4 text-emerald-600" />}
        value={selectedNew}
        label="Will be added"
        color="emerald"
      />
      <SummaryCard
        icon={<InfoIcon className="size-4 text-muted-foreground" />}
        value={existsCount}
        label="Already exist"
        color="muted"
      />
      {unresolvedCount > 0 && (
        <SummaryCard
          icon={<XCircleIcon className="size-4 text-red-600" />}
          value={unresolvedCount}
          label="Need a category"
          color="red"
        />
      )}
    </div>
  );
}

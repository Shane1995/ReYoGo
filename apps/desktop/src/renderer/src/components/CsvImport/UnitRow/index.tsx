import { cn } from '@reyogo/ui';
import { ReviewStatus } from '../review';
import type { ReviewUnit } from '../review';
import { ReviewRow } from '../components/ReviewRow';
import { StatusBadge } from '../components/StatusBadge';

export function UnitRow({
  unit,
  onToggle,
}: {
  unit: ReviewUnit;
  onToggle: (name: string) => void;
}) {
  const disabled = unit.status === ReviewStatus.Exists;

  return (
    <ReviewRow selected={unit.selected} onToggle={() => onToggle(unit.name)} disabled={disabled}>
      <span className={cn('flex-1 font-medium', disabled && 'text-muted-foreground')}>
        {unit.name}
      </span>
      <StatusBadge status={unit.status} />
    </ReviewRow>
  );
}

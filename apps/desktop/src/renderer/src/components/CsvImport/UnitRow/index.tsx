import { cn } from '@reyogo/ui';
import { UNIT_STATUS } from '../review';
import type { ReviewUnit } from '../review';
import { ReviewRow } from '../ReviewRow';
import { StatusBadge } from '../StatusBadge';

export function UnitRow({
  unit,
  onToggle,
}: {
  unit: ReviewUnit;
  onToggle: (name: string) => void;
}) {
  const disabled = unit.status === UNIT_STATUS.Exists;

  return (
    <ReviewRow selected={unit.selected} onToggle={() => onToggle(unit.name)} disabled={disabled}>
      <span className={cn('flex-1 font-medium', disabled && 'text-muted-foreground')}>
        {unit.name}
      </span>
      <StatusBadge status={unit.status} />
    </ReviewRow>
  );
}

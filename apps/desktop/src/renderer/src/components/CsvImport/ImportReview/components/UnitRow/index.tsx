import { cn } from '@reyogo/ui';
import { ReviewStatus } from '../../../review';
import { ReviewRow } from '../../../components/ReviewRow';
import { StatusBadge } from '../../../components/StatusBadge';
import type { UnitRowProps } from './types';

export function UnitRow({ unit, onToggle }: UnitRowProps) {
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

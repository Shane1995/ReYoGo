import { Badge, Button } from '@reyogo/ui';
import type { ArchivedUnitRowProps } from './types';

export function ArchivedUnitRow({ unit, onRestore, onHardDelete }: ArchivedUnitRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground">{unit.name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary">
          {unit.usageCount} {unit.usageCount === 1 ? 'item' : 'items'}
        </Badge>
        <Button size="sm" variant="outline" onClick={() => onRestore(unit.id)}>
          Restore
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={unit.usageCount > 0}
          onClick={() => onHardDelete(unit.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

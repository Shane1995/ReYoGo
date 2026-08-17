import { ArchivedUnitRow } from './components/ArchivedUnitRow';
import type { ArchivedUnitsPanelProps } from './types';

export function ArchivedUnitsPanel({ units, onRestore, onHardDelete }: ArchivedUnitsPanelProps) {
  if (units.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No archived units</p>;
  }

  return (
    <div>
      {units.map((unit) => (
        <ArchivedUnitRow
          key={unit.id}
          unit={unit}
          onRestore={onRestore}
          onHardDelete={onHardDelete}
        />
      ))}
    </div>
  );
}

import { UNIT_STATUS } from '../review';
import type { ReviewUnit } from '../review';
import { Section } from '../Section';
import { UnitRow } from '../UnitRow';

export function UnitsSection({
  units,
  onToggle,
}: {
  units: ReviewUnit[];
  onToggle: (name: string) => void;
}) {
  if (units.length === 0) return null;

  return (
    <Section
      title="Units of measure"
      count={units.length}
      defaultOpen={units.some((u) => u.status === UNIT_STATUS.New)}
    >
      {units.map((u) => (
        <UnitRow key={u.name} unit={u} onToggle={onToggle} />
      ))}
    </Section>
  );
}

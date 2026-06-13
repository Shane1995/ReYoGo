import { ReviewStatus } from '../../../review';
import { Section } from '../../../components/Section';
import { UnitRow } from '../UnitRow';
import type { UnitsSectionProps } from './types';

export function UnitsSection({ units, onToggle }: UnitsSectionProps) {
  if (units.length === 0) return null;

  return (
    <Section
      title="Units of measure"
      count={units.length}
      defaultOpen={units.some((u) => u.status === ReviewStatus.New)}
    >
      {units.map((u) => (
        <UnitRow key={u.name} unit={u} onToggle={onToggle} />
      ))}
    </Section>
  );
}

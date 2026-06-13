import type { ReviewUnit } from '../../../review';

export interface UnitsSectionProps {
  units: ReviewUnit[];
  onToggle: (name: string) => void;
}

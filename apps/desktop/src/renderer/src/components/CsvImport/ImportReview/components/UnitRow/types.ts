import type { ReviewUnit } from '../../../review';

export interface UnitRowProps {
  unit: ReviewUnit;
  onToggle: (name: string) => void;
}

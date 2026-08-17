import type { UnitWithUsage } from '../../types';

export type ArchivedUnitsPanelProps = {
  units: UnitWithUsage[];
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
};

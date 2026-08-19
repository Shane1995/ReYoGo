import type { UnitWithUsage } from '../../../../types';

export type ArchivedUnitRowProps = {
  unit: UnitWithUsage;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
};

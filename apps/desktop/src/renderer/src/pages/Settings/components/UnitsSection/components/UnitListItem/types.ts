import type { UnitWithUsage } from '../../types';

export type UnitListItemProps = {
  unit: UnitWithUsage;
  onRename: (id: string, name: string) => void;
  onArchive: (id: string) => void;
};

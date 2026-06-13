import type { UnitOption } from '../../../ItemsTable/types';

export type UomSelectProps = {
  value: string;
  unitOptions: UnitOption[];
  onChange: (v: string) => void;
};

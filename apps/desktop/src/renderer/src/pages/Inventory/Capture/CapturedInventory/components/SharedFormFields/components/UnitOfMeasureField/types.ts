import type { UnitOption } from '../../../ItemsTable/types';

export type UnitOfMeasureFieldProps = {
  value: string;
  unitOptions: UnitOption[];
  onChange: (value: string) => void;
};

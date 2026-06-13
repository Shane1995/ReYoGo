import type { FilterField, FilterValues } from '../../../types';

export type FilterFieldViewProps = {
  field: FilterField;
  values: FilterValues;
  onChange: (key: string, value: string | string[]) => void;
};

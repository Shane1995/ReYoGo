import type { FilterField, FilterValues } from '../../../types';

export type SearchFilterProps = {
  field: FilterField;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
};

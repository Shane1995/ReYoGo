import type { FilterField, FilterValues } from '../../../types';

export type SingleSelectProps = {
  field: FilterField;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
};

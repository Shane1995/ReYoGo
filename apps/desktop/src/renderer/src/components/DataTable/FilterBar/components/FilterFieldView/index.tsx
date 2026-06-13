import { SearchFilter } from '../SearchFilter';
import { MultiSelect } from '../MultiSelect';
import { SingleSelect } from '../SingleSelect';
import type { FilterFieldViewProps } from './types';

export function FilterFieldView({ field, values, onChange }: FilterFieldViewProps) {
  if (field.type === 'search')
    return <SearchFilter field={field} values={values} onChange={onChange} />;
  if (field.multi) return <MultiSelect field={field} values={values} onChange={onChange} />;
  return <SingleSelect field={field} values={values} onChange={onChange} />;
}

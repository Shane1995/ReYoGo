import { Input } from '@reyogo/ui';
import { SearchIcon } from 'lucide-react';
import { searchPlaceholderOf } from '../../utils/searchPlaceholderOf';
import { stringValueOf } from '../../utils/stringValueOf';
import type { SearchFilterProps } from './types';

export function SearchFilter({ field, values, onChange }: SearchFilterProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/50" />
      <Input
        type="text"
        placeholder={searchPlaceholderOf(field)}
        value={stringValueOf(values, field.key)}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="h-8 w-72 pl-8 text-xs placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

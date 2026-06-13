import { XIcon } from 'lucide-react';
import { hasActiveFilters } from './utils/hasActiveFilters';
import { FilterFieldView } from './components/FilterFieldView';
import type { FilterBarProps } from './types';

export function FilterBar({ filters, values, onChange, onClearAll }: FilterBarProps) {
  const active = hasActiveFilters(values);

  return (
    <div className="flex flex-wrap items-center gap-2 bg-background">
      {filters.map((field) => (
        <FilterFieldView key={field.key} field={field} values={values} onChange={onChange} />
      ))}

      {active && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-foreground"
        >
          <XIcon className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}

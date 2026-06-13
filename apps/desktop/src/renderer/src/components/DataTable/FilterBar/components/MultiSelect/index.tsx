import { Popover, PopoverContent, PopoverTrigger, cn } from '@reyogo/ui';
import { ChevronDownIcon } from 'lucide-react';
import { resolveOptions } from '../../utils/resolveOptions';
import { buildGroups } from '../../utils/buildGroups';
import { arrayValueOf } from '../../utils/arrayValueOf';
import { MultiSelectGroups } from '../MultiSelectGroups';
import type { MultiSelectProps } from './types';

export function MultiSelect({ field, values, onChange }: MultiSelectProps) {
  const selected = arrayValueOf(values, field.key);
  const options = resolveOptions(field, values);
  const groups = buildGroups(options);

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(field.key, next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors',
            selected.length > 0
              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
              : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--input)] hover:text-[var(--foreground)]',
          )}
        >
          {field.label}
          {selected.length > 0 && (
            <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {selected.length}
            </span>
          )}
          <ChevronDownIcon className="size-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1 max-h-72 overflow-y-auto" align="start">
        <MultiSelectGroups
          groups={groups}
          options={options}
          selected={selected}
          onToggle={toggle}
        />
      </PopoverContent>
    </Popover>
  );
}

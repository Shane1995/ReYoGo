import { Popover, PopoverContent, PopoverTrigger } from '@reyogo/ui';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import { resolveOptions } from '../../utils/resolveOptions';
import { selectedOptionLabel } from '../../utils/selectedOptionLabel';
import { singleSelectTriggerClassName } from '../../utils/singleSelectTriggerClassName';
import { stringValueOf } from '../../utils/stringValueOf';
import { SingleSelectOption } from '../SingleSelectOption';
import type { SingleSelectProps } from './types';

export function SingleSelect({ field, values, onChange }: SingleSelectProps) {
  const selected = stringValueOf(values, field.key);
  const options = resolveOptions(field, values);
  const label = selectedOptionLabel(selected, options, field.label);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={singleSelectTriggerClassName(selected)}>
          {label}
          <ChevronDownIcon className="size-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1 max-h-72 overflow-y-auto" align="start">
        {selected && (
          <button
            type="button"
            onClick={() => onChange(field.key, '')}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          >
            <XIcon className="size-3" />
            Clear
          </button>
        )}
        {options.map((opt) => (
          <SingleSelectOption
            key={opt.value}
            opt={opt}
            selected={selected}
            onSelect={(v) => onChange(field.key, v)}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

import { Input, Popover, PopoverContent, PopoverTrigger, cn } from '@reyogo/ui';
import { ChevronDownIcon, CheckIcon, SearchIcon, XIcon } from 'lucide-react';
import type { FilterField, FilterValues, FilterOption } from '../types';

type Props = {
  filters: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string | string[]) => void;
  onClearAll: () => void;
};

function resolveOptions(field: FilterField, values: FilterValues): FilterOption[] {
  if (!field.options) return [];
  return typeof field.options === 'function' ? field.options(values) : field.options;
}

function hasActiveFilters(values: FilterValues): boolean {
  return Object.values(values).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v)));
}

function MultiSelect({
  field,
  values,
  onChange,
}: {
  field: FilterField;
  values: FilterValues;
  onChange: (key: string, value: string[]) => void;
}) {
  const selected = (values[field.key] as string[]) ?? [];
  const options = resolveOptions(field, values);

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
      <PopoverContent className="w-48 p-1" align="start">
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-[var(--muted-foreground)]">No options</p>
        ) : (
          options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              <div
                className={cn(
                  'flex size-3.5 shrink-0 items-center justify-center rounded-sm border',
                  selected.includes(opt.value)
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-[var(--border)]',
                )}
              >
                {selected.includes(opt.value) && <CheckIcon className="size-2.5 text-white" />}
              </div>
              <span className="truncate">{opt.label}</span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}

function SingleSelect({
  field,
  values,
  onChange,
}: {
  field: FilterField;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
}) {
  const selected = (values[field.key] as string) ?? '';
  const options = resolveOptions(field, values);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors',
            selected
              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
              : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--input)] hover:text-[var(--foreground)]',
          )}
        >
          {selected
            ? (options.find((o) => o.value === selected)?.label ?? field.label)
            : field.label}
          <ChevronDownIcon className="size-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
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
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(field.key, opt.value)}
            className={cn(
              'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)]',
              selected === opt.value && 'bg-[var(--accent)]',
            )}
          >
            <span className="size-3 shrink-0">
              {selected === opt.value && <CheckIcon className="size-3 text-[var(--primary)]" />}
            </span>
            <span className="truncate">{opt.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar({ filters, values, onChange, onClearAll }: Props) {
  const active = hasActiveFilters(values);

  return (
    <div className="flex flex-wrap items-center gap-2 bg-background">
      {filters.map((field) => {
        if (field.type === 'search') {
          return (
            <div key={field.key} className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                type="text"
                placeholder={field.placeholder ?? `Search ${field.label}…`}
                value={(values[field.key] as string) ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="h-8 w-52 pl-8 text-xs placeholder:text-muted-foreground/40"
              />
            </div>
          );
        }
        if (field.multi) {
          return <MultiSelect key={field.key} field={field} values={values} onChange={onChange} />;
        }
        return <SingleSelect key={field.key} field={field} values={values} onChange={onChange} />;
      })}

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

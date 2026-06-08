import { useState } from 'react';
import {
  format,
  parseISO,
  isValid,
  subDays,
  subMonths,
  startOfYear,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../lib/utils';

const STORE_FMT = 'yyyy-MM-dd';
const DISPLAY_FMT = 'd MMM yyyy';

function parseStored(s: string): Date | undefined {
  if (!s) return undefined;
  const d = parseISO(s);
  return isValid(d) ? d : undefined;
}

function toStore(d: Date): string {
  return format(d, STORE_FMT);
}

function fmtDisplay(d: Date): string {
  return format(d, DISPLAY_FMT);
}

type Preset = { label: string; range: () => DateRange };

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function definedRangeOf(r: DateRange | undefined): { from: Date; to: Date | undefined } | null {
  if (!r) return null;
  if (!r.from) return null;
  return { from: r.from, to: r.to };
}

function storeRangeOf(r: DateRange | undefined): { from: string; to: string } {
  const bounds = definedRangeOf(r);
  if (!bounds) return { from: '', to: '' };
  if (!bounds.to) return { from: toStore(bounds.from), to: '' };
  if (isSameDay(bounds.from, bounds.to)) return { from: toStore(bounds.from), to: '' };
  return { from: toStore(bounds.from), to: toStore(bounds.to) };
}

function handleRangeSelect(
  r: DateRange | undefined,
  onChange: (from: string, to: string) => void,
  closeOnComplete: () => void,
): void {
  const { from, to } = storeRangeOf(r);
  onChange(from, to);
  if (!from || !to) return;
  closeOnComplete();
}

function selectedRangeOf(
  fromDate: Date | undefined,
  toDate: Date | undefined,
): DateRange | undefined {
  if (!fromDate && !toDate) return undefined;
  return { from: fromDate, to: toDate };
}

function rangeLabelOf(fromDate: Date | undefined, toDate: Date | undefined): string {
  if (!fromDate) return toDate ? `Until ${fmtDisplay(toDate)}` : '';
  if (!toDate) return `From ${fmtDisplay(fromDate)}`;
  return `${fmtDisplay(fromDate)} – ${fmtDisplay(toDate)}`;
}

function isCompleteRange(from: string, to: string): boolean {
  if (!from) return false;
  return !!to;
}

function rangeBoundsOf(r: DateRange): { from: Date; to: Date } | null {
  if (!r.from) return null;
  if (!r.to) return null;
  return { from: r.from, to: r.to };
}

function triggerButtonClassName(hasRange: boolean, className: string | undefined): string {
  const stateCls = hasRange
    ? 'border border-[var(--primary)]/30 bg-primary/5 text-primary hover:bg-primary/10'
    : 'border border-input bg-background text-muted-foreground/60 hover:border-input hover:text-foreground';
  return cn(
    'flex h-8 min-w-0 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50',
    stateCls,
    className,
  );
}

function isActivePreset(preset: Preset, from: string, to: string): boolean {
  if (!isCompleteRange(from, to)) return false;
  const bounds = rangeBoundsOf(preset.range());
  if (!bounds) return false;
  if (from !== toStore(bounds.from)) return false;
  return to === toStore(bounds.to);
}

const PRESET_GROUPS: { label: string; presets: Preset[] }[] = [
  {
    label: 'Relative',
    presets: [
      { label: 'Last 7 days', range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
      { label: 'Last 30 days', range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
      { label: 'Last 3 months', range: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
      { label: 'Last 6 months', range: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
    ],
  },
  {
    label: 'This period',
    presets: [
      {
        label: 'This week',
        range: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }),
      },
      { label: 'This month', range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
      { label: 'This year', range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
    ],
  },
];

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = 'All dates',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const fromDate = parseStored(from);
  const toDate = parseStored(to);
  const selected = selectedRangeOf(fromDate, toDate);
  const hasRange = selected !== undefined;
  const label = rangeLabelOf(fromDate, toDate);

  function applyPreset(preset: Preset) {
    const r = preset.range();
    onChange(r.from ? toStore(r.from) : '', r.to ? toStore(r.to) : '');
    setOpen(false);
  }

  function clearRange(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('', '');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerButtonClassName(hasRange, className)}>
          <CalendarIcon className="size-3 shrink-0 opacity-60" />
          <span className="truncate">{label || placeholder}</span>
          {hasRange && (
            <XIcon
              className="ml-1 size-3 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              onClick={clearRange}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 bg-[var(--nav-bg)] border-[var(--nav-border)] overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <div className="flex divide-x divide-[var(--nav-border)]">
          {/* Left: preset list */}
          <div className="flex w-44 flex-col bg-muted/20 py-2">
            {PRESET_GROUPS.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="mx-3 my-1.5 border-t border-[var(--nav-border)]/60" />}
                <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40 select-none">
                  {group.label}
                </p>
                {group.presets.map((p) => {
                  const active = isActivePreset(p, from, to);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm transition-colors',
                        active
                          ? 'text-primary font-medium bg-primary/8'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                      )}
                    >
                      {active && (
                        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary align-middle mb-0.5" />
                      )}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Clear */}
            {hasRange && (
              <div className="mt-auto">
                <div className="mx-3 my-1.5 border-t border-[var(--nav-border)]/60" />
                <button
                  type="button"
                  onClick={() => {
                    onChange('', '');
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                  Clear range
                </button>
              </div>
            )}
          </div>

          {/* Right: calendar */}
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={(r) => handleRangeSelect(r, onChange, () => setOpen(false))}
            showOutsideDays
            className="p-3 select-none"
            classNames={{
              months: 'flex flex-col',
              month: 'space-y-1',
              month_caption: 'relative flex h-8 items-center justify-center',
              caption_label: 'text-sm font-medium text-foreground',
              nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
              button_previous:
                'flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              button_next:
                'flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              weekdays: 'flex',
              weekday:
                'w-8 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground/50 pb-1',
              weeks: 'space-y-0.5',
              week: 'flex',
              day: 'relative h-8 w-8 p-0 text-center',
              day_button:
                'relative z-10 h-8 w-8 flex items-center justify-center text-sm rounded focus:outline-none',
              today: 'font-semibold',
              outside: 'opacity-30',
              disabled: 'opacity-20 pointer-events-none',
              hidden: 'invisible',
              selected:
                '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90',
              range_start: 'rounded-l-full bg-primary/10',
              range_end: 'rounded-r-full bg-primary/10',
              range_middle:
                'rounded-none bg-primary/10 [&>button]:rounded-none [&>button]:hover:bg-primary/20',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left' ? (
                  <ChevronLeftIcon className="size-3.5" />
                ) : (
                  <ChevronRightIcon className="size-3.5" />
                ),
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

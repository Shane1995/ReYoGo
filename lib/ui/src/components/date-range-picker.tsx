import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon, XIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../lib/utils';
import { type Preset, PresetList } from './date-range-picker-presets';
import { RangeCalendar } from './date-range-picker-calendar';

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
          <PresetList
            from={from}
            to={to}
            hasRange={hasRange}
            onApplyPreset={applyPreset}
            onClear={() => {
              onChange('', '');
              setOpen(false);
            }}
          />

          <RangeCalendar
            selected={selected}
            onSelect={(r) => handleRangeSelect(r, onChange, () => setOpen(false))}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

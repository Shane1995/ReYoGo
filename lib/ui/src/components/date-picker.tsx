import { useState, useRef, useEffect } from 'react';
import { format, parse, parseISO, isValid } from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../lib/utils';

const DISPLAY_FORMAT = 'dd/MM/yyyy';
const STORE_FORMAT = 'yyyy-MM-dd';

const PARSE_FORMATS = [
  'dd/MM/yyyy',
  'd/M/yyyy',
  'dd-MM-yyyy',
  'd-M-yyyy',
  'yyyy-MM-dd',
  'dd MMM yyyy',
  'd MMM yyyy',
];

function tryParse(raw: string): Date | null {
  const trimmed = raw.trim();
  for (const fmt of PARSE_FORMATS) {
    const d = parse(trimmed, fmt, new Date());
    if (isValid(d) && d.getFullYear() > 1900) return d;
  }
  return null;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() => {
    if (!value) return '';
    const d = parseISO(value);
    return isValid(d) ? format(d, DISPLAY_FORMAT) : value;
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setInputText('');
    } else {
      const d = parseISO(value);
      if (isValid(d)) setInputText(format(d, DISPLAY_FORMAT));
    }
  }, [value]);

  const selected = value ? parseISO(value) : undefined;
  const validSelected = selected && isValid(selected) ? selected : undefined;

  function commitText(raw: string) {
    if (!raw.trim()) {
      onChange('');
      return;
    }
    const d = tryParse(raw);
    if (d) {
      onChange(format(d, STORE_FORMAT));
      setInputText(format(d, DISPLAY_FORMAT));
    }
  }

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex h-8 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-ring/40">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          placeholder={placeholder}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={(e) => commitText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitText(inputText);
              e.currentTarget.blur();
            }
          }}
          className="h-full w-32 rounded-l-md bg-transparent px-2.5 text-sm focus:outline-none"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-full items-center border-l border-input px-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none rounded-r-md"
              aria-label="Open calendar"
            >
              <CalendarIcon className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-[var(--nav-bg)] border-[var(--nav-border)]"
            align="start"
            sideOffset={4}
          >
            <DayPicker
              mode="single"
              selected={validSelected}
              onSelect={(date) => {
                if (date) {
                  setInputText(format(date, DISPLAY_FORMAT));
                  onChange(format(date, STORE_FORMAT));
                }
                setOpen(false);
                inputRef.current?.focus();
              }}
              defaultMonth={validSelected}
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
                  'relative z-10 h-8 w-8 flex items-center justify-center text-sm rounded focus:outline-none hover:bg-muted transition-colors',
                today: 'font-semibold',
                outside: 'opacity-30',
                disabled: 'opacity-20 pointer-events-none',
                hidden: 'invisible',
                selected:
                  '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90',
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
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

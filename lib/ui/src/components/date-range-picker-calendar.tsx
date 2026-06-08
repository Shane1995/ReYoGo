import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';

const DAY_PICKER_CLASS_NAMES = {
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
  range_middle: 'rounded-none bg-primary/10 [&>button]:rounded-none [&>button]:hover:bg-primary/20',
};

function RangeChevron({ orientation }: { orientation?: string }) {
  if (orientation === 'left') return <ChevronLeftIcon className="size-3.5" />;
  return <ChevronRightIcon className="size-3.5" />;
}

type RangeCalendarProps = {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
};

export function RangeCalendar({ selected, onSelect }: RangeCalendarProps) {
  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      className="p-3 select-none"
      classNames={DAY_PICKER_CLASS_NAMES}
      components={{ Chevron: RangeChevron }}
    />
  );
}

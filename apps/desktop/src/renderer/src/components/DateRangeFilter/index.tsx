import { DatePicker } from '@reyogo/ui';
import type { DateRangeFilterProps } from './types';

export function DateRangeFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      <div className="flex items-center gap-1.5">
        <label className="text-muted-foreground shrink-0">From</label>
        <DatePicker value={fromDate} onChange={onFromChange} />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-muted-foreground shrink-0">To</label>
        <DatePicker value={toDate} onChange={onToChange} />
      </div>
      {(fromDate || toDate) && (
        <button
          type="button"
          onClick={() => {
            onFromChange('');
            onToChange('');
          }}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

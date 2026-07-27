import { DatePicker } from '@reyogo/ui';
import type { AsOfDateFilterProps } from './types';

export function AsOfDateFilter({ value, onChange }: AsOfDateFilterProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <label className="text-muted-foreground shrink-0">As of</label>
      <DatePicker value={value} onChange={onChange} />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Live
        </button>
      )}
    </div>
  );
}

import { cn } from '@reyogo/ui';
import {
  fieldLabel,
  selectClass,
} from '@/pages/Inventory/Analysis/components/AnalysisFilters/constants';
import { typeLabel } from '@/pages/Inventory/Analysis/utils/typeLabel';
import type { TypeFilterProps } from './types';

export function TypeFilter({ value, options, onChange }: TypeFilterProps) {
  return (
    <div className="flex flex-col">
      <label className={fieldLabel}>Type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, 'w-36', !value && 'text-muted-foreground/60')}
      >
        <option value="">All types</option>
        {options.map((t) => (
          <option key={t} value={t}>
            {typeLabel(t)}
          </option>
        ))}
      </select>
    </div>
  );
}

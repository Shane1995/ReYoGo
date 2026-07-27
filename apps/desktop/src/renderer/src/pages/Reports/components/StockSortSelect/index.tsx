import { cn } from '@reyogo/ui';
import {
  fieldLabel,
  selectClass,
} from '@/pages/Inventory/Analysis/components/AnalysisFilters/constants';
import { SORT_OPTIONS } from './constants';
import type { StockSortKey } from '../../hooks/useStockLevelRows/types';
import type { StockSortSelectProps } from './types';

function isSortKey(value: string): value is StockSortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

export function StockSortSelect({ value, onChange }: StockSortSelectProps) {
  return (
    <div className="flex flex-col">
      <label className={fieldLabel}>Sort by</label>
      <select
        value={value}
        onChange={(e) => {
          if (isSortKey(e.target.value)) onChange(e.target.value);
        }}
        className={cn(selectClass, 'w-40')}
      >
        {SORT_OPTIONS.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

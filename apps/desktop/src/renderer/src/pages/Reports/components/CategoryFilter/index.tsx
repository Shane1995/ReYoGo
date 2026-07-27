import { Popover, PopoverContent, PopoverTrigger, cn } from '@reyogo/ui';
import { ChevronDownIcon } from 'lucide-react';
import {
  fieldLabel,
  selectClass,
} from '@/pages/Inventory/Analysis/components/AnalysisFilters/constants';
import { CategoryOption } from './components/CategoryOption';
import { toggleCategory } from './utils/toggleCategory';
import { triggerLabelOf } from './utils/triggerLabelOf';
import type { CategoryFilterProps } from './types';

export function CategoryFilter({ selected, options, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-col">
      <label className={fieldLabel}>Category</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(selectClass, 'flex w-56 items-center justify-between gap-2 text-left')}
          >
            <span className={cn(selected.length === 0 && 'text-muted-foreground/60')}>
              {triggerLabelOf(selected)}
            </span>
            <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 max-h-72 overflow-y-auto p-1" align="start">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">No categories</p>
          ) : (
            options.map((category) => (
              <CategoryOption
                key={category}
                category={category}
                selected={selected}
                onToggle={(c) => onChange(toggleCategory(selected, c))}
              />
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

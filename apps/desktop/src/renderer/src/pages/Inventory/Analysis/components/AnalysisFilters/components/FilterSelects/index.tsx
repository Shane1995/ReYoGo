import { cn } from '@reyogo/ui';
import { typeLabel } from '../../../../utils/typeLabel';
import { fieldLabel, selectClass } from '../../constants';
import type { FilterSelectsProps } from './types';

export function FilterSelects({
  filterType,
  filterCategory,
  availableTypes,
  availableCategories,
  setFilterType,
  setFilterCategory,
}: FilterSelectsProps) {
  return (
    <>
      <div className="flex flex-col">
        <label className={fieldLabel}>Type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={cn(selectClass, 'w-36', !filterType && 'text-muted-foreground/60')}
        >
          <option value="">All types</option>
          {availableTypes.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className={fieldLabel}>Category</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={cn(selectClass, 'w-44', !filterCategory && 'text-muted-foreground/60')}
        >
          <option value="">All categories</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

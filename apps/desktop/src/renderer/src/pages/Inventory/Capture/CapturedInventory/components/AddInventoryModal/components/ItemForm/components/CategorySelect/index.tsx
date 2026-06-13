import { cn } from '@reyogo/ui';
import { modalInputClass } from '../../../../../SharedFormFields';
import { typeGroupLabel } from '../../../../../../utils/typeConfig';
import type { CategorySelectProps } from './types';

export function CategorySelect({
  categories,
  inventoryTypes,
  value,
  onChange,
}: CategorySelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(modalInputClass, 'cursor-pointer')}
      >
        <option value="">Select category…</option>
        {inventoryTypes
          .filter((t) => categories.some((c) => c.type === t))
          .map((type) => (
            <optgroup key={type} label={typeGroupLabel(type)}>
              {categories
                .filter((c) => c.name.trim() && c.type === type)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
}

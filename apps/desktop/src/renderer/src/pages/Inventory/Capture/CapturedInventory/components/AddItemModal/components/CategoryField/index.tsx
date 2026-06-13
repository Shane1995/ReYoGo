import { cn } from '@reyogo/ui';
import { modalInputClass } from '../../../SharedFormFields';
import type { CategoryFieldProps } from './types';

export function CategoryField({ categories, categoryId, onChange }: CategoryFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
      <select
        value={categoryId}
        onChange={(e) => onChange(e.target.value)}
        className={cn(modalInputClass, 'cursor-pointer')}
      >
        <option value="">Select category</option>
        {[...categories]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.type} → {c.name}
            </option>
          ))}
      </select>
    </div>
  );
}

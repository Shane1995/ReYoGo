import { cn } from '@reyogo/ui';
import type { CategorySelectProps } from './types';

export function CategorySelect({
  categoryId,
  namedCategories,
  types,
  selectedCategory,
  onChange,
}: CategorySelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Category
      </label>
      <select
        value={categoryId}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40',
          !categoryId && 'text-muted-foreground',
        )}
        required
      >
        <option value="" disabled>
          Select a category…
        </option>
        {types.map((type) => (
          <optgroup key={type} label={type}>
            {namedCategories
              .filter((c) => c.type === type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      {selectedCategory && (
        <p className="text-xs text-muted-foreground">
          Type: <span className="font-medium text-foreground">{selectedCategory.type}</span>
        </p>
      )}
    </div>
  );
}

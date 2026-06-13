import { INVENTORY_TYPES } from '@reyogo/types';
import { cn } from '@reyogo/ui';
import { inputClass } from '../../constants';
import type { CategoryFieldsProps } from './types';

export function CategoryFields({
  name,
  type,
  onNameChange,
  onTypeChange,
  onSave,
}: CategoryFieldsProps) {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          className={inputClass}
          placeholder="Category name"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className={cn(inputClass, 'cursor-pointer')}
        >
          {!type && <option value="">Select type</option>}
          {INVENTORY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

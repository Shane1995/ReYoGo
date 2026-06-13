import { cn } from '@reyogo/ui';
import { INVENTORY_TYPES } from '@reyogo/types';
import type { InventoryType } from '@reyogo/types';
import { ReviewStatus } from '../../../review';
import { ReviewRow } from '../../../components/ReviewRow';
import { StatusBadge } from '../../../components/StatusBadge';
import { SelectInput } from '../../../components/SelectInput';
import type { CategoryRowProps } from './types';

export function CategoryRow({ category, onToggle, onFixType }: CategoryRowProps) {
  const disabled = category.status === ReviewStatus.Exists;
  const showTypeSelect = category.typeWarning && !disabled;

  return (
    <ReviewRow
      selected={category.selected}
      onToggle={() => onToggle(category.id)}
      disabled={disabled}
    >
      <div className="flex flex-1 items-center gap-3 min-w-0 flex-wrap">
        <span className={cn('font-medium truncate', disabled && 'text-muted-foreground')}>
          {category.name}
        </span>
        {showTypeSelect ? (
          <SelectInput
            value=""
            onChange={(value) => onFixType(category.id, value as InventoryType)}
            className="border-amber-400"
          >
            <option value="" disabled>
              {category.type} (unknown)
            </option>
            {INVENTORY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">{category.type}</span>
        )}
      </div>
      <StatusBadge status={category.status} />
    </ReviewRow>
  );
}

import { cn } from '@reyogo/ui';
import { INVENTORY_TYPES } from '@reyogo/types';
import { CATEGORY_STATUS } from '../review';
import type { ReviewCategory, InventoryType } from '../review';
import { ReviewRow } from '../ReviewRow';
import { StatusBadge } from '../StatusBadge';
import { SelectInput } from '../SelectInput';

export function CategoryRow({
  category,
  onToggle,
  onFixType,
}: {
  category: ReviewCategory;
  onToggle: (id: string) => void;
  onFixType: (id: string, type: InventoryType) => void;
}) {
  const disabled = category.status === CATEGORY_STATUS.Exists;
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

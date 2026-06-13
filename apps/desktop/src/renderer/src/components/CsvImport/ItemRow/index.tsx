import { cn } from '@reyogo/ui';
import { ReviewStatus } from '../review';
import type { ReviewItem } from '../review';
import { ReviewRow } from '../ReviewRow';
import { StatusBadge } from '../StatusBadge';
import { SelectInput } from '../SelectInput';

export function ItemRow({
  item,
  availableCategories,
  onToggle,
  onAssignCategory,
}: {
  item: ReviewItem;
  availableCategories: { name: string }[];
  onToggle: (name: string) => void;
  onAssignCategory: (itemName: string, categoryName: string) => void;
}) {
  const isUnresolved = item.status === ReviewStatus.Unresolved;
  const disabled = item.status === ReviewStatus.Exists || isUnresolved;

  return (
    <ReviewRow selected={item.selected} onToggle={() => onToggle(item.name)} disabled={disabled}>
      <div className="flex flex-1 items-center gap-3 min-w-0 flex-wrap">
        <span className={cn('font-medium truncate', disabled && 'text-muted-foreground')}>
          {item.name}
        </span>
        {isUnresolved ? (
          <SelectInput value="" onChange={(value) => onAssignCategory(item.name, value)}>
            <option value="">Assign category…</option>
            {availableCategories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </SelectInput>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
            {[item.categoryName, item.unit].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
      <StatusBadge status={item.status} />
    </ReviewRow>
  );
}

import { cn } from '@reyogo/ui';
import { OptionCost } from '../OptionCost';
import type { OptionRowProps } from './types';

export function OptionRow({ item, isHighlighted, onSelect }: OptionRowProps) {
  return (
    <li
      id={`item-option-${item.id}`}
      role="option"
      aria-selected={isHighlighted}
      className={cn(
        'cursor-pointer px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2',
        isHighlighted && 'bg-accent text-accent-foreground',
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(item);
      }}
    >
      <span className="truncate">{item.name}</span>
      <OptionCost cost={item.lastUnitCostInclVat} />
    </li>
  );
}

import { OptionRow } from '../OptionRow';
import type { AutocompleteOptionsListProps } from './types';

export function AutocompleteOptionsList({
  items,
  highlightIndex,
  onSelect,
}: AutocompleteOptionsListProps) {
  if (items.length === 0) {
    return (
      <li className="px-3 py-2 text-sm text-muted-foreground" role="option">
        No items match
      </li>
    );
  }
  return (
    <>
      {items.map((item, index) => (
        <OptionRow
          key={item.id}
          item={item}
          isHighlighted={index === highlightIndex}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

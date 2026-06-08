import { createPortal } from 'react-dom';
import { cn } from '@reyogo/ui';
import { formatMoney } from '../../utils/formatMoney';
import { useItemAutocomplete } from './useItemAutocomplete';

export type ItemOption = {
  id: string;
  name: string;
  entityId?: string;
  categoryName?: string;
  typeLabel?: string;
  lastUnitCostInclVat?: number;
};

type Props = {
  items: ItemOption[];
  value: string;
  onChange: (itemId: string) => void;
  entityId: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  inputId?: string;
  onSelectComplete?: () => void;
  onNavigateRight?: () => void;
};

function OptionCost({ cost }: { cost: number | undefined }) {
  if (cost == null) return null;
  return (
    <span className="shrink-0 font-mono text-xs tabular-nums opacity-60">{formatMoney(cost)}</span>
  );
}

function OptionRow({
  item,
  isHighlighted,
  onSelect,
}: {
  item: ItemOption;
  isHighlighted: boolean;
  onSelect: (item: ItemOption) => void;
}) {
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

function AutocompleteOptionsList({
  items,
  highlightIndex,
  onSelect,
}: {
  items: ItemOption[];
  highlightIndex: number;
  onSelect: (item: ItemOption) => void;
}) {
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

export function ItemAutocomplete({
  items,
  value,
  onChange,
  entityId,
  placeholder = 'Search or select item…',
  className,
  disabled,
  inputId,
  onSelectComplete,
  onNavigateRight,
}: Props) {
  const {
    isOpen,
    setQuery,
    setIsOpen,
    highlightIndex,
    listStyle,
    containerId,
    listId,
    filteredItems,
    displayValue,
    handleFocus,
    handleBlur,
    handleSelect,
    handleKeyDown,
  } = useItemAutocomplete({ items, value, entityId, onChange, onSelectComplete, onNavigateRight });

  return (
    <div id={containerId} className={cn('relative w-full min-w-[10rem]', className)}>
      <input
        id={inputId}
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={listId}
        className={cn(
          'h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0',
        )}
      />
      {isOpen &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            style={{
              position: 'fixed',
              top: listStyle.top,
              left: listStyle.left,
              width: listStyle.width,
              zIndex: 9999,
            }}
            className="max-h-64 overflow-auto rounded-md border border-[var(--nav-border)] bg-popover py-1 shadow-lg"
          >
            <AutocompleteOptionsList
              items={filteredItems}
              highlightIndex={highlightIndex}
              onSelect={handleSelect}
            />
          </ul>,
          document.body,
        )}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@reyogo/ui';
import { formatMoney } from '../../utils/formatMoney';

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

function entityFilteredItemsOf(items: ItemOption[], entityId: string): ItemOption[] {
  if (!entityId) return items;
  return items.filter((item) => item.entityId === entityId);
}

function displayValueOf(
  isOpen: boolean,
  query: string,
  selectedItem: ItemOption | undefined,
): string {
  if (isOpen) return query;
  return selectedItem?.name ?? '';
}

function isInsideAutocomplete(target: HTMLElement, containerId: string, listId: string): boolean {
  if (target.closest?.(`#${containerId}`)) return true;
  return !!target.closest?.(`#${listId}`);
}

function blurActiveElement(): void {
  if (!(document.activeElement instanceof HTMLElement)) return;
  document.activeElement.blur();
}

function moveHighlightDown(current: number, length: number): number {
  return (current + 1) % Math.max(1, length);
}

function moveHighlightUp(current: number, length: number): number {
  if (current <= 0) return Math.max(0, length - 1);
  return current - 1;
}

const OPEN_LIST_KEYS = ['Enter', ' ', 'ArrowDown'];

function shouldOpenOnKey(key: string): boolean {
  return OPEN_LIST_KEYS.includes(key);
}

function handleKeyDownClosed(
  e: React.KeyboardEvent,
  onNavigateRight: (() => void) | undefined,
  openList: () => void,
): void {
  if (e.key === 'ArrowRight') {
    onNavigateRight?.();
    return;
  }
  if (shouldOpenOnKey(e.key)) {
    openList();
  }
}

const PREVENT_DEFAULT_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter']);

type OpenKeyActions = Record<string, (() => void) | undefined>;

function handleKeyDownOpen(e: React.KeyboardEvent, actions: OpenKeyActions): void {
  const action = actions[e.key];
  if (!action) return;
  if (PREVENT_DEFAULT_KEYS.has(e.key)) e.preventDefault();
  action();
}

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
  const entityFilteredItems = entityFilteredItemsOf(items, entityId);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [listStyle, setListStyle] = useState({ top: 0, left: 0, width: 0 });
  const [containerId] = useState(() => `item-autocomplete-${window.crypto.randomUUID()}`);
  const listId = `${containerId}-list`;

  const selectedItem = useMemo(
    () => entityFilteredItems.find((i) => i.id === value),
    [entityFilteredItems, value],
  );

  const filteredItems = useMemo(() => {
    const sorted = [...entityFilteredItems].sort((a, b) => a.name.localeCompare(b.name));
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((i) => i.name.toLowerCase().includes(q));
  }, [entityFilteredItems, query]);

  const displayValue = displayValueOf(isOpen, query, selectedItem);

  useEffect(() => {
    if (!isOpen) return;
    setHighlightIndex(filteredItems.findIndex((i) => i.id === value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isOpen]);

  useEffect(() => {
    if (highlightIndex < 0) return;
    const highlighted = filteredItems[highlightIndex];
    if (!highlighted) return;
    document.getElementById(`item-option-${highlighted.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex, filteredItems]);

  const updateListPosition = useCallback(() => {
    const el = document.getElementById(containerId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setListStyle({ top: rect.bottom, left: rect.left, width: Math.max(rect.width, 200) });
  }, [containerId]);

  useEffect(() => {
    if (!isOpen) return;
    updateListPosition();
    const handler = () => updateListPosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isOpen, query, updateListPosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (isInsideAutocomplete(target, containerId, listId)) return;
      setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [containerId, listId]);

  const handleFocus = () => {
    setIsOpen(true);
    setQuery('');
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleSelect = useCallback(
    (item: ItemOption) => {
      onChange(item.id);
      setQuery('');
      setIsOpen(false);
      onSelectComplete?.();
    },
    [onChange, onSelectComplete],
  );

  const openList = useCallback(() => {
    setIsOpen(true);
    setQuery('');
  }, []);

  const closeList = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    blurActiveElement();
  }, []);

  const moveHighlightDownward = useCallback(() => {
    setHighlightIndex((i) => moveHighlightDown(i, filteredItems.length));
  }, [filteredItems.length]);

  const moveHighlightUpward = useCallback(() => {
    setHighlightIndex((i) => moveHighlightUp(i, filteredItems.length));
  }, [filteredItems.length]);

  const commitHighlighted = useCallback(() => {
    const item = filteredItems[highlightIndex];
    if (!item) return;
    handleSelect(item);
  }, [filteredItems, highlightIndex, handleSelect]);

  const openKeyActions = useMemo<OpenKeyActions>(
    () => ({
      ArrowDown: moveHighlightDownward,
      ArrowUp: moveHighlightUpward,
      Enter: commitHighlighted,
      Escape: closeList,
    }),
    [moveHighlightDownward, moveHighlightUpward, commitHighlighted, closeList],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        handleKeyDownClosed(e, onNavigateRight, openList);
        return;
      }
      handleKeyDownOpen(e, openKeyActions);
    },
    [isOpen, onNavigateRight, openList, openKeyActions],
  );

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

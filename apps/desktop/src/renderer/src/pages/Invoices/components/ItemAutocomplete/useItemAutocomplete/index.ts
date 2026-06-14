import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ItemOption } from '../types';
import { OPEN_LIST_KEYS, PREVENT_DEFAULT_KEYS } from './constants';
import type { UseItemAutocompleteParams, OpenKeyActions } from './types';

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

function handleKeyDownOpen(e: React.KeyboardEvent, actions: OpenKeyActions): void {
  const action = actions[e.key];
  if (!action) return;
  if (PREVENT_DEFAULT_KEYS.has(e.key)) e.preventDefault();
  action();
}

export function useItemAutocomplete(params: UseItemAutocompleteParams) {
  const { items, value, entityId, onChange, onSelectComplete, onNavigateRight } = params;
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

  return {
    query,
    setQuery,
    isOpen,
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
  };
}

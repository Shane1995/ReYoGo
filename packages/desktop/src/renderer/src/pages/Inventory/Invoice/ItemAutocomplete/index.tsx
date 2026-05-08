import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ItemOption = {
  id: string;
  name: string;
  categoryName?: string;
  typeLabel?: string;
};

type Props = {
  items: ItemOption[];
  value: string;
  onChange: (itemId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  inputId?: string;
  onSelectComplete?: () => void;
};

export function ItemAutocomplete({
  items,
  value,
  onChange,
  placeholder = "Search or select item…",
  className,
  disabled,
  inputId,
  onSelectComplete,
}: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [listStyle, setListStyle] = useState({ top: 0, left: 0, width: 0 });
  const [containerId] = useState(() => `item-autocomplete-${window.crypto.randomUUID()}`);
  const listId = `${containerId}-list`;

  const selectedItem = useMemo(() => items.find((i) => i.id === value), [items, value]);

  const filteredItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const displayValue = isOpen ? query : (selectedItem?.name ?? "");

  useEffect(() => {
    if (!isOpen) return;
    setHighlightIndex(filteredItems.findIndex((i) => i.id === value));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isOpen]);

  useEffect(() => {
    if (highlightIndex < 0) return;
    const highlighted = filteredItems[highlightIndex];
    if (!highlighted) return;
    document.getElementById(`item-option-${highlighted.id}`)?.scrollIntoView({ block: "nearest" });
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
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isOpen, query, updateListPosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest?.(`#${containerId}`) || target.closest?.(`#${listId}`)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerId, listId]);

  const handleFocus = () => {
    setIsOpen(true);
    setQuery("");
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        setIsOpen(true);
        setQuery("");
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % Math.max(1, filteredItems.length));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? Math.max(0, filteredItems.length - 1) : i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[highlightIndex];
      if (item) {
        onChange(item.id);
        setQuery("");
        setIsOpen(false);
        onSelectComplete?.();
      }
      return;
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }
  };

  const handleSelect = (item: ItemOption) => {
    onChange(item.id);
    setQuery("");
    setIsOpen(false);
    onSelectComplete?.();
  };

  return (
    <div id={containerId} className={cn("relative w-full min-w-[10rem]", className)}>
      <input
        id={inputId}
        type="text"
        value={displayValue}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
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
          "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
        )}
      />
      {isOpen &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            style={{ position: "fixed", top: listStyle.top, left: listStyle.left, width: listStyle.width, zIndex: 9999 }}
            className="max-h-64 overflow-auto rounded-md border border-[var(--nav-border)] bg-popover py-1 shadow-lg"
          >
            {filteredItems.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="option">
                No items match
              </li>
            ) : (
              filteredItems.map((item, index) => (
                <li
                  key={item.id}
                  id={`item-option-${item.id}`}
                  role="option"
                  aria-selected={index === highlightIndex}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                    index === highlightIndex && "bg-accent text-accent-foreground"
                  )}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                >
                  {item.name}
                </li>
              ))
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}

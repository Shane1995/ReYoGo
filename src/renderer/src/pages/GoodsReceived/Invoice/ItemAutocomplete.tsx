import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ItemOption = {
  id: string;
  name: string;
  categoryName?: string;
  typeLabel?: string;
};

function itemLabel(item: ItemOption): string {
  if (item.categoryName && item.typeLabel) {
    return `${item.name} (${item.typeLabel} → ${item.categoryName})`;
  }
  return item.name;
}

type Props = {
  items: ItemOption[];
  value: string;
  onChange: (itemId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Optional id for the input so parent can focus it (e.g. after adding a row). */
  inputId?: string;
  /** Called after selecting an item (Enter or click); use to move focus to next field. */
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
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [listStyle, setListStyle] = useState({ top: 0, left: 0, width: 0 });
  const [containerId] = useState(() => `item-autocomplete-${crypto.randomUUID()}`);
  const listId = `${containerId}-list`;

  const selectedItem = useMemo(
    () => items.find((i) => i.id === value),
    [items, value]
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.categoryName?.toLowerCase().includes(q)) ||
        (i.typeLabel?.toLowerCase().includes(q))
    );
  }, [items, query]);

  const displayValue = isOpen ? query : (selectedItem ? itemLabel(selectedItem) : "");

  useEffect(() => {
    if (!isOpen) return;
    setHighlightIndex(0);
  }, [query, isOpen]);

  const updateListPosition = useCallback(() => {
    const el = document.getElementById(containerId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setListStyle({
      top: rect.bottom,
      left: rect.left,
      width: Math.max(rect.width, 200),
    });
  }, [containerId]);

  useEffect(() => {
    if (!isOpen) return;
    updateListPosition();
    const onScrollOrResize = () => updateListPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen, query, updateListPosition]);

  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list || highlightIndex < 0) return;
    const option = list.children[highlightIndex] as HTMLElement | undefined;
    option?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, listId]);

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
    setQuery(selectedItem ? itemLabel(selectedItem) : "");
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
      setHighlightIndex((i) =>
        i <= 0 ? Math.max(0, filteredItems.length - 1) : i - 1
      );
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
      setQuery(selectedItem ? itemLabel(selectedItem) : "");
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
        aria-activedescendant={
          isOpen && filteredItems[highlightIndex]
            ? `item-option-${filteredItems[highlightIndex].id}`
            : undefined
        }
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
            style={{
              position: "fixed",
              top: listStyle.top,
              left: listStyle.left,
              width: listStyle.width,
              zIndex: 9999,
            }}
            className="max-h-56 overflow-auto rounded-md border border-[var(--nav-border)] bg-popover py-1 shadow-lg"
          >
            {filteredItems.length === 0 ? (
              <li className="px-2.5 py-2 text-sm text-muted-foreground" role="option">
                No items match
              </li>
            ) : (
              filteredItems.map((item, index) => (
                <li
                  key={item.id}
                  id={`item-option-${item.id}`}
                  role="option"
                  aria-selected={value === item.id || index === highlightIndex}
                  className={cn(
                    "cursor-pointer px-2.5 py-1.5 text-sm",
                    (value === item.id || index === highlightIndex) &&
                    "bg-accent text-accent-foreground"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                >
                  {itemLabel(item)}
                </li>
              ))
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}

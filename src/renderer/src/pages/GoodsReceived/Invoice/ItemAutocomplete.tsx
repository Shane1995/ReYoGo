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

// Build grouped structure while preserving flat-index for keyboard nav
type GroupedSection = {
  typeLabel: string;
  categories: {
    categoryName: string;
    items: { item: ItemOption; flatIndex: number }[];
  }[];
};

function buildGroups(flat: ItemOption[]): GroupedSection[] {
  const typeOrder: string[] = [];
  const typeMap = new Map<string, Map<string, { item: ItemOption; flatIndex: number }[]>>();

  flat.forEach((item, flatIndex) => {
    const tl = item.typeLabel ?? "Other";
    const cn = item.categoryName ?? "Uncategorised";

    if (!typeMap.has(tl)) {
      typeMap.set(tl, new Map());
      typeOrder.push(tl);
    }
    const catMap = typeMap.get(tl)!;
    if (!catMap.has(cn)) catMap.set(cn, []);
    catMap.get(cn)!.push({ item, flatIndex });
  });

  return typeOrder.map((tl) => {
    const catMap = typeMap.get(tl)!;
    return {
      typeLabel: tl,
      categories: Array.from(catMap.entries()).map(([categoryName, items]) => ({
        categoryName,
        items,
      })),
    };
  });
}

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

  const selectedItem = useMemo(() => items.find((i) => i.id === value), [items, value]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.categoryName?.toLowerCase().includes(q) ||
        i.typeLabel?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const groups = useMemo(() => buildGroups(filteredItems), [filteredItems]);

  // Display: just the item name (no type→category suffix)
  const displayValue = isOpen ? query : (selectedItem?.name ?? "");

  useEffect(() => {
    if (!isOpen) return;
    setHighlightIndex(0);
  }, [query, isOpen]);

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
    const list = document.getElementById(listId);
    if (!list || highlightIndex < 0) return;
    const option = list.querySelector(`[data-flat-index="${highlightIndex}"]`) as HTMLElement | null;
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
            style={{ position: "fixed", top: listStyle.top, left: listStyle.left, width: listStyle.width, zIndex: 9999 }}
            className="max-h-64 overflow-auto rounded-md border border-[var(--nav-border)] bg-popover py-1 shadow-lg"
          >
            {filteredItems.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="option">
                No items match
              </li>
            ) : (
              groups.map((group) => (
                <li key={group.typeLabel} role="presentation">
                  {/* Type header */}
                  <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.typeLabel}
                  </div>
                  <ul role="group">
                    {group.categories.map((cat) => (
                      <li key={cat.categoryName} role="presentation">
                        {/* Category sub-header */}
                        <div className="px-4 py-0.5 text-[11px] text-muted-foreground/70 italic">
                          {cat.categoryName}
                        </div>
                        <ul role="group">
                          {cat.items.map(({ item, flatIndex }) => (
                            <li
                              key={item.id}
                              id={`item-option-${item.id}`}
                              role="option"
                              data-flat-index={flatIndex}
                              aria-selected={value === item.id || flatIndex === highlightIndex}
                              className={cn(
                                "cursor-pointer px-6 py-1.5 text-sm",
                                (value === item.id || flatIndex === highlightIndex) &&
                                  "bg-accent text-accent-foreground"
                              )}
                              onMouseEnter={() => setHighlightIndex(flatIndex)}
                              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}

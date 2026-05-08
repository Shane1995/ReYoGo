import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TypeValue, InventoryCategory, InventoryItem } from "../../types";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-0"
);

type MoveItemSelectProps = {
  item: InventoryItem;
  categories: InventoryCategory[];
  allTypes: string[];
  onMove: (categoryId: string, type: TypeValue) => void;
  onClose: () => void;
};

export function MoveItemSelect({ item, categories, allTypes, onMove, onClose }: MoveItemSelectProps) {
  const ref = useRef<HTMLSelectElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const others = categories.filter((c) => c.id !== item.categoryId && c.name.trim());
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">Move to:</span>
      <select
        ref={ref}
        defaultValue=""
        className={cn(inputClass, "min-w-[11rem] cursor-pointer text-xs")}
        onChange={(e) => {
          const target = categories.find((c) => c.id === e.target.value);
          if (target) onMove(target.id, target.type);
        }}
        onBlur={onClose}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      >
        <option value="" disabled>Select category…</option>
        {allTypes.map((type) => {
          const cats = others.filter((c) => c.type === type);
          if (!cats.length) return null;
          return (
            <optgroup key={type} label={type}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          );
        })}
      </select>
      <button
        type="button"
        className="text-xs text-muted-foreground hover:text-foreground"
        onMouseDown={(e) => { e.preventDefault(); onClose(); }}
      >
        ✕
      </button>
    </div>
  );
}

import { Trash2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TypeValue, InventoryCategory } from "../../types";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-0"
);

type BulkActionBarProps = {
  selectedItemIds: Set<string>;
  selectedCategoryIds: Set<string>;
  categories: InventoryCategory[];
  allTypes: string[];
  onClearSelection: () => void;
  onBulkMoveItems: (categoryId: string, type: TypeValue) => void;
  onBulkMoveCategories: (type: TypeValue) => void;
  onBulkDeleteItems: () => void;
  onBulkDeleteCategories: () => void;
};

export function BulkActionBar({
  selectedItemIds,
  selectedCategoryIds,
  categories,
  allTypes,
  onClearSelection,
  onBulkMoveItems,
  onBulkMoveCategories,
  onBulkDeleteItems,
  onBulkDeleteCategories,
}: BulkActionBarProps) {
  const itemCount = selectedItemIds.size;
  const catCount = selectedCategoryIds.size;
  const total = itemCount + catCount;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 shadow-sm">
      <span className="text-sm font-medium text-foreground">
        {total} selected
        {itemCount > 0 && catCount > 0 && (
          <span className="text-muted-foreground font-normal">
            {" "}({itemCount} item{itemCount !== 1 ? "s" : ""}, {catCount} categor{catCount !== 1 ? "ies" : "y"})
          </span>
        )}
        {itemCount > 0 && catCount === 0 && (
          <span className="text-muted-foreground font-normal"> item{itemCount !== 1 ? "s" : ""}</span>
        )}
        {catCount > 0 && itemCount === 0 && (
          <span className="text-muted-foreground font-normal"> categor{catCount !== 1 ? "ies" : "y"}</span>
        )}
      </span>

      <div className="h-4 w-px bg-border" />

      {itemCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Move items to:</span>
          <select
            defaultValue=""
            className={cn(inputClass, "w-auto min-w-[10rem] cursor-pointer text-xs h-7")}
            onChange={(e) => {
              const cat = categories.find((c) => c.id === e.target.value);
              if (cat) onBulkMoveItems(cat.id, cat.type);
              e.target.value = "";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); e.currentTarget.click(); }
            }}
          >
            <option value="" disabled>Select category…</option>
            {allTypes.map((type) => {
              const cats = categories.filter((c) => c.type === type && c.name.trim());
              if (!cats.length) return null;
              return (
                <optgroup key={type} label={type}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              );
            })}
          </select>
        </div>
      )}

      {catCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Move categories to:</span>
          <select
            defaultValue=""
            className={cn(inputClass, "w-auto min-w-[8rem] cursor-pointer text-xs h-7")}
            onChange={(e) => {
              onBulkMoveCategories(e.target.value as TypeValue);
              e.target.value = "";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); e.currentTarget.click(); }
            }}
          >
            <option value="" disabled>Select type…</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            if (itemCount > 0) onBulkDeleteItems();
            if (catCount > 0) onBulkDeleteCategories();
          }}
        >
          <Trash2Icon className="size-3.5" />
          Delete selected
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={onClearSelection}
        >
          <XIcon className="size-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}

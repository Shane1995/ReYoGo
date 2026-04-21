import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InventoryCategory, InventoryItem } from "../../types";

type Props = {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  units: string[];
  onSave: (id: string | null, values: Omit<InventoryItem, "id">) => void;
  onClose: () => void;
};

export function EditItemDialog({ item, categories, units, onSave, onClose }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const [unitOfMeasure, setUnitOfMeasure] = useState(item?.unitOfMeasure ?? "");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const namedCategories = categories.filter((c) => c.name.trim());
  const selectedCategory = namedCategories.find((c) => c.id === categoryId);
  const types = Array.from(new Set(namedCategories.map((c) => c.type)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    onSave(item?.id ?? null, {
      name: name.trim(),
      categoryId,
      type: selectedCategory?.type ?? "",
      unitOfMeasure: unitOfMeasure || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {item ? "Edit item" : "Add item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item name
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken breast"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={cn(
                "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40",
                !categoryId && "text-muted-foreground"
              )}
              required
            >
              <option value="" disabled>Select a category…</option>
              {types.map((type) => (
                <optgroup key={type} label={type}>
                  {namedCategories
                    .filter((c) => c.type === type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                Good type: <span className="font-medium text-foreground">{selectedCategory.type}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unit of measure
            </label>
            <select
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 text-muted-foreground"
            >
              <option value="">None</option>
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || !categoryId}>
              {item ? "Save changes" : "Add item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

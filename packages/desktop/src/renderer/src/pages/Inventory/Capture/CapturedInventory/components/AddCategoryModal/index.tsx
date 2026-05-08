import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { TypeValue, InventoryCategory } from "../../types";
import { useInventory } from "../../Context/InventoryContext";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type AddCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (category: Omit<InventoryCategory, "id">) => void;
};

export function AddCategoryModal({ open, onClose, onSave }: AddCategoryModalProps) {
  const { goodTypes, categories } = useInventory();
  const [name, setName] = useState("");
  const [type, setType] = useState<TypeValue>("");

  const allTypes = useMemo(() => {
    const fromCategories = categories.map((c) => c.type).filter(Boolean);
    return Array.from(new Set([...goodTypes, ...fromCategories]));
  }, [goodTypes, categories]);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, type: type || allTypes[0] || "" });
    setName("");
    setType("");
    onClose();
  }, [name, type, allTypes, onSave, onClose]);

  const handleClose = useCallback(() => {
    setName("");
    setType("");
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--nav-border)] bg-background shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Add category</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new category to use in the item dropdown.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className={inputClass}
              placeholder="Category name"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeValue)}
              className={cn(inputClass, "cursor-pointer")}
            >
              {!type && <option value="">Select type</option>}
              {allTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </div>
      </div>
    </div>
  );
}

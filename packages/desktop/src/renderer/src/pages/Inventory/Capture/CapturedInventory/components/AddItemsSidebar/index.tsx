import { useState, useCallback, useEffect, useMemo } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TypeValue, InventoryCategory, InventoryItem } from "../../types";
import { AddCategoryModal } from "../AddCategoryModal";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type PendingRow = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasure: string;
};

function createEmptyRow(): PendingRow {
  return { id: crypto.randomUUID(), name: "", categoryId: "", type: "", unitOfMeasure: "" };
}

type AddItemsSidebarProps = {
  categories: InventoryCategory[];
  items: InventoryItem[];
  units: string[];
  onAddItem: (item: Omit<InventoryItem, "id">) => void;
  onAddCategory: (category: Omit<InventoryCategory, "id">) => void;
  onClose: () => void;
};

export function AddItemsSidebar({
  categories,
  items,
  units,
  onAddItem,
  onAddCategory,
  onClose,
}: AddItemsSidebarProps) {
  const [rows, setRows] = useState<PendingRow[]>([createEmptyRow()]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedRowId) return;
    const id = `sidebar-item-name-${lastAddedRowId}`;
    const t = setTimeout(() => {
      document.getElementById(id)?.focus();
      setLastAddedRowId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastAddedRowId]);

  const addRow = useCallback(() => {
    const newRow = createEmptyRow();
    setRows((prev) => [...prev, newRow]);
    setLastAddedRowId(newRow.id);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((r) => r.id !== id)));
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<PendingRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const existingNames = useMemo(
    () => new Set(items.map((i) => i.name.trim().toLowerCase())),
    [items]
  );

  const duplicateIds = useMemo(() => {
    const seen = new Map<string, string>();
    const dupes = new Set<string>();
    for (const row of rows) {
      const key = row.name.trim().toLowerCase();
      if (!key) continue;
      if (existingNames.has(key)) {
        dupes.add(row.id);
      } else if (seen.has(key)) {
        dupes.add(row.id);
        dupes.add(seen.get(key)!);
      } else {
        seen.set(key, row.id);
      }
    }
    return dupes;
  }, [rows, existingNames]);

  const submit = useCallback(() => {
    const valid = rows.filter((r) => r.name.trim() && r.categoryId && !duplicateIds.has(r.id));
    if (!valid.length) return;
    valid.forEach((r) => {
      onAddItem({
        name: r.name.trim(),
        categoryId: r.categoryId,
        type: r.type,
        unitOfMeasure: r.unitOfMeasure || undefined,
      });
    });
    setRows([createEmptyRow()]);
  }, [rows, duplicateIds, onAddItem]);

  const hasValidRows = rows.some((r) => r.name.trim() && r.categoryId && !duplicateIds.has(r.id));

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-[var(--nav-border)] bg-background min-h-0">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--nav-border)] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Add items</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Fill rows then submit — or add a category first.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setCategoryModalOpen(true)}
          >
            Add category
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="rounded-none border-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                <TableHead className="px-3 text-xs font-medium text-foreground">Name</TableHead>
                <TableHead className="px-3 text-xs font-medium text-foreground">Category</TableHead>
                <TableHead className="px-3 text-xs font-medium text-foreground">Unit</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="border-[var(--nav-border)] hover:bg-muted/20">
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col gap-1">
                      <input
                        id={`sidebar-item-name-${row.id}`}
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addRow();
                        }}
                        className={cn(
                          inputClass,
                          "min-w-0",
                          duplicateIds.has(row.id) &&
                            "border-destructive focus:ring-destructive/50"
                        )}
                        placeholder="Item name"
                      />
                      {duplicateIds.has(row.id) && (
                        <span className="text-xs text-destructive">Already exists</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <select
                      value={row.categoryId}
                      onChange={(e) => {
                        const categoryId = e.target.value;
                        const cat = categories.find((c) => c.id === categoryId);
                        updateRow(row.id, cat ? { categoryId, type: cat.type } : { categoryId });
                      }}
                      className={cn(inputClass, "min-w-0 cursor-pointer")}
                    >
                      <option value="">Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.type} → {c.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <select
                      value={row.unitOfMeasure}
                      onChange={(e) =>
                        updateRow(row.id, { unitOfMeasure: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          addRow();
                        }
                      }}
                      className={cn(inputClass, "min-w-0 cursor-pointer")}
                    >
                      <option value="">— none —</option>
                      {units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Remove row"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t border-[var(--nav-border)] bg-muted/10 flex justify-end px-3 py-2">
            <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5 text-xs h-7">
              <PlusIcon className="size-3.5" />
              Add row
            </Button>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--nav-border)] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRows([createEmptyRow()])}
        >
          Clear
        </Button>
        <Button type="button" size="sm" onClick={submit} disabled={!hasValidRows}>
          Submit
        </Button>
      </div>

      <AddCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={onAddCategory}
      />
    </aside>
  );
}

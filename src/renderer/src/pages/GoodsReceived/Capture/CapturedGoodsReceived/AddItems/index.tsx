import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "../Context/InventoryContext";
import { TYPE_LABELS, UNIT_OPTIONS } from "../types";
import type { TypeValue, UnitOfMeasure } from "../types";
import { cn } from "@/lib/utils";
import { AddCategoryModal } from "./AddCategoryModal";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type PendingRow = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasure: UnitOfMeasure;
};

function createEmptyRow(): PendingRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    categoryId: "",
    type: "food",
    unitOfMeasure: "unit",
  };
}

export default function AddItemsPage() {
  const { categories, items, addItem, addCategory } = useInventory();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PendingRow[]>([createEmptyRow()]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedRowId) return;
    const id = `add-item-name-${lastAddedRowId}`;
    const focus = () => {
      document.getElementById(id)?.focus();
      setLastAddedRowId(null);
    };
    const t = setTimeout(focus, 50);
    return () => clearTimeout(t);
  }, [lastAddedRowId]);

  const addRow = useCallback(() => {
    const newRow = createEmptyRow();
    setRows((prev) => [...prev, newRow]);
    setLastAddedRowId(newRow.id);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<PendingRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const duplicateIds = useMemo(() => {
    const existingNames = new Set(items.map((i) => i.name.trim().toLowerCase()));
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
  }, [rows, items]);

  const submit = useCallback(() => {
    const valid = rows.filter((r) => r.name.trim() && r.categoryId && !duplicateIds.has(r.id));
    if (!valid.length) return;
    valid.forEach((r) => {
      addItem({
        name: r.name.trim(),
        categoryId: r.categoryId,
        type: r.type,
        unitOfMeasure: r.unitOfMeasure,
      });
    });
    setRows([createEmptyRow()]);
  }, [rows, duplicateIds, addItem]);

  const hasValidRows = rows.some((r) => r.name.trim() && r.categoryId && !duplicateIds.has(r.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Add items</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Add items with name, category and unit. Add a category first if needed.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCategoryModalOpen(true)}
          >
            Add category
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <div className="rounded-lg border border-[var(--nav-border)] bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                  <TableHead className="font-medium text-foreground">Name</TableHead>
                  <TableHead className="font-medium text-foreground">Category</TableHead>
                  <TableHead className="font-medium text-foreground">Unit of measure</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[var(--nav-border)] hover:bg-muted/30"
                  >
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <input
                          id={`add-item-name-${row.id}`}
                          value={row.name}
                          onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addRow();
                          }}
                          className={cn(
                            inputClass,
                            "min-w-[10rem]",
                            duplicateIds.has(row.id) && "border-destructive focus:ring-destructive/50"
                          )}
                          placeholder="Item name"
                        />
                        {duplicateIds.has(row.id) && (
                          <span className="shrink-0 text-xs text-destructive">Already exists</span>
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        className={cn(inputClass, "min-w-[10rem] cursor-pointer")}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {TYPE_LABELS[c.type]} → {c.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <select
                        value={row.unitOfMeasure}
                        onChange={(e) =>
                          updateRow(row.id, { unitOfMeasure: e.target.value as UnitOfMeasure })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.click();
                          } else if (e.key === "Tab") {
                            e.preventDefault();
                            addRow();
                          }
                        }}
                        className={cn(inputClass, "min-w-[6rem] cursor-pointer")}
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeRow(row.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t border-[var(--nav-border)] bg-muted/10">
              <div className="flex justify-end px-3 py-2">
                <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5">
                  <PlusIcon className="size-4" aria-hidden />
                  Add row
                </Button>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--nav-border)] px-3 py-2">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button variant="success" size="sm" onClick={submit} disabled={!hasValidRows}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(category) => addCategory(category)}
      />
    </div>
  );
}

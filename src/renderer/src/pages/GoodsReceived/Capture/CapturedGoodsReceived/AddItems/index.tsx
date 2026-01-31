import { useState, useCallback, useEffect } from "react";
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
import { TYPE_LABELS, TYPE_VALUES, UNIT_OPTIONS } from "../types";
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
  const { categories, addItem, addCategory, submitCategory, submitItem } = useInventory();
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

  const submit = useCallback(() => {
    const valid = rows.filter((r) => r.name.trim() && r.categoryId);
    valid.forEach((r) => {
      const id = addItem({
        name: r.name.trim(),
        categoryId: r.categoryId,
        type: r.type,
        unitOfMeasure: r.unitOfMeasure,
      });
      submitItem(id);
    });
    if (valid.length) {
      setRows([createEmptyRow()]);
    }
  }, [rows, addItem, submitItem]);

  const hasValidRows = rows.some((r) => r.name.trim() && r.categoryId);

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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCategoryModalOpen(true)}
            >
              Add category
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={!hasValidRows}>
              Submit
            </Button>
          </div>
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
                      <input
                        id={`add-item-name-${row.id}`}
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        className={cn(inputClass, "min-w-[10rem]")}
                        placeholder="Item name"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <select
                        value={row.categoryId}
                        onChange={(e) => {
                          const categoryId = e.target.value;
                          const cat = categories.find((c) => c.id === categoryId);
                          updateRow(row.id, cat ? { categoryId, type: cat.type } : { categoryId });
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
            <div className="flex justify-end border-t border-[var(--nav-border)] bg-muted/10 px-3 py-2">
              <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5">
                <PlusIcon className="size-4" aria-hidden />
                Add row
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(category) => {
          const id = addCategory(category);
          submitCategory(id);
        }}
      />
    </div>
  );
}

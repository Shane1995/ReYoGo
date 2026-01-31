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
import { TYPE_LABELS, TYPE_VALUES } from "../types";
import type { TypeValue } from "../types";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type PendingRow = {
  id: string;
  name: string;
  type: TypeValue;
};

function createEmptyRow(): PendingRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "food",
  };
}

export default function AddCategoriesPage() {
  const { addCategory, submitCategory } = useInventory();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PendingRow[]>([createEmptyRow()]);
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedRowId) return;
    const id = `add-category-name-${lastAddedRowId}`;
    const focus = () => {
      const el = document.getElementById(id);
      el?.focus();
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
    const valid = rows.filter((r) => r.name.trim());
    valid.forEach((r) => {
      const id = addCategory({ name: r.name.trim(), type: r.type });
      submitCategory(id);
    });
    if (valid.length) {
      setRows([createEmptyRow()]);
    }
  }, [rows, addCategory, submitCategory]);

  const hasValidRows = rows.some((r) => r.name.trim());

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Add categories</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Add categories with name and type. They appear in Captured Goods Received and in the Add items dropdown.
            </p>
          </div>
          <div className="flex gap-2">
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
                  <TableHead className="font-medium text-foreground">Type</TableHead>
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
                        id={`add-category-name-${row.id}`}
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        className={cn(inputClass, "min-w-[10rem]")}
                        placeholder="Category name"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <select
                        value={row.type}
                        onChange={(e) => updateRow(row.id, { type: e.target.value as TypeValue })}
                        className={cn(inputClass, "min-w-[8rem] cursor-pointer")}
                      >
                        {TYPE_VALUES.map((t) => (
                          <option key={t} value={t}>
                            {TYPE_LABELS[t]}
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
    </div>
  );
}

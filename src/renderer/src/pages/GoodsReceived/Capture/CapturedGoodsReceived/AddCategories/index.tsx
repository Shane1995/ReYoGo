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
  return { id: crypto.randomUUID(), name: "", type: "food" };
}

export default function AddCategoriesPage() {
  const { categories, addCategory } = useInventory();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PendingRow[]>([createEmptyRow()]);
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedRowId) return;
    const id = `add-category-name-${lastAddedRowId}`;
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
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  // Per-row duplicate detection: matches existing categories or sibling rows
  const duplicateIds = useMemo(() => {
    const existingNames = new Set(categories.map((c) => c.name.trim().toLowerCase()));
    const seen = new Map<string, string>(); // normalised name → first row id
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
  }, [rows, categories]);

  const submit = useCallback(() => {
    const valid = rows.filter((r) => r.name.trim() && !duplicateIds.has(r.id));
    if (!valid.length) return;
    valid.forEach((r) => addCategory({ name: r.name.trim(), type: r.type }));
    setRows([createEmptyRow()]);
  }, [rows, duplicateIds, addCategory]);

  const hasValidRows = rows.some((r) => r.name.trim() && !duplicateIds.has(r.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Add categories</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add categories with name and type. They appear in Captured Goods Received and in the Add items dropdown.
          </p>
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
                {rows.map((row) => {
                  const isDupe = duplicateIds.has(row.id);
                  return (
                    <TableRow key={row.id} className="border-[var(--nav-border)] hover:bg-muted/30">
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            id={`add-category-name-${row.id}`}
                            value={row.name}
                            onChange={(e) => updateRow(row.id, { name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addRow();
                            }}
                            className={cn(
                              inputClass,
                              "min-w-[10rem]",
                              isDupe && "border-destructive focus:ring-destructive/50"
                            )}
                            placeholder="Category name"
                          />
                          {isDupe && (
                            <span className="shrink-0 text-xs text-destructive">Already exists</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <select
                          value={row.type}
                          onChange={(e) => updateRow(row.id, { type: e.target.value as TypeValue })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.currentTarget.click();
                            } else if (e.key === "Tab") {
                              e.preventDefault();
                              addRow();
                            }
                          }}
                          className={cn(inputClass, "min-w-[8rem] cursor-pointer")}
                        >
                          {TYPE_VALUES.map((t) => (
                            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
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
                  );
                })}
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
    </div>
  );
}

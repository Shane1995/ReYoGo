import { useState, useCallback, useEffect, useMemo } from "react";
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
import { useInventory } from "../CapturedInventory/Context/InventoryContext";
import type { TypeValue } from "../CapturedInventory/types";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-muted px-2.5 text-sm",
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

export default function AddItemsPage() {
  const { categories, items, units, addItem } = useInventory();
  const namedCategories = categories.filter((c) => c.name.trim());
  const categoryTypes = Array.from(new Set(namedCategories.map((c) => c.type)));
  const [rows, setRows] = useState<PendingRow[]>([createEmptyRow()]);
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedRowId) return;
    const id = `add-item-name-${lastAddedRowId}`;
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
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<PendingRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
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
        unitOfMeasure: r.unitOfMeasure || undefined,
      });
    });
    setRows([createEmptyRow()]);
  }, [rows, duplicateIds, addItem]);

  // Require all named rows to also have a category before enabling Submit
  const namedRows = rows.filter((r) => r.name.trim());
  const hasValidRows = namedRows.some((r) => r.categoryId && !duplicateIds.has(r.id));
  const hasIncompleteRows = namedRows.some((r) => !r.categoryId);
  const canSubmit = hasValidRows && !hasIncompleteRows;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Add items</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Add items with a name, category and unit. Add a category first if needed.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5">
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
                {rows.map((row) => {
                  const isDupe = duplicateIds.has(row.id);
                  const isIncomplete = !!row.name.trim() && !row.categoryId;
                  return (
                    <TableRow key={row.id} className="border-[var(--nav-border)] hover:bg-muted/30">
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
                              isDupe && "border-destructive focus:ring-destructive/50"
                            )}
                            placeholder="Item name"
                          />
                          {isDupe && (
                            <span className="shrink-0 text-xs text-destructive">Already exists</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <select
                          value={row.categoryId}
                          onChange={(e) => {
                            const categoryId = e.target.value;
                            const cat = namedCategories.find((c) => c.id === categoryId);
                            updateRow(row.id, cat ? { categoryId, type: cat.type } : { categoryId });
                          }}
                          className={cn(
                            inputClass,
                            "min-w-[10rem] cursor-pointer",
                            isIncomplete && "border-destructive focus:ring-destructive/50"
                          )}
                        >
                          <option value="">Select a category…</option>
                          {categoryTypes.map((type) => (
                            <optgroup key={type} label={type}>
                              {namedCategories
                                .filter((c) => c.type === type)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                        {isIncomplete && (
                          <span className="text-xs text-destructive mt-0.5 block">Required</span>
                        )}
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
                          className={cn(inputClass, "min-w-[6rem] cursor-pointer")}
                        >
                          <option value="">— none —</option>
                          {units.map((u) => (
                            <option key={u} value={u}>{u}</option>
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
                <Button variant="outline" size="sm" onClick={() => setRows([createEmptyRow()])}>
                  Clear
                </Button>
                <Button size="sm" onClick={submit} disabled={!canSubmit}>
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

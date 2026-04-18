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
import { useInventory } from "../CapturedGoodsReceived/Context/InventoryContext";
import type { TypeValue } from "../CapturedGoodsReceived/types";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type PendingRow = { id: string; name: string; type: TypeValue };

function createEmptyRow(defaultType: string): PendingRow {
  return { id: crypto.randomUUID(), name: "", type: defaultType };
}

export default function AddCategoriesPage() {
  const { categories, addCategory, goodTypes } = useInventory();
  const defaultType = goodTypes[0] ?? '';
  const [rows, setRows] = useState<PendingRow[]>([{ id: crypto.randomUUID(), name: "", type: '' }]);
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  // Once goodTypes loads, update any rows that still have no type
  useEffect(() => {
    if (!defaultType) return;
    setRows((prev) => prev.map((r) => r.type ? r : { ...r, type: defaultType }));
  }, [defaultType]);

  useEffect(() => {
    if (!lastAddedRowId) return;
    const id = `add-category-name-${lastAddedRowId}`;
    const t = setTimeout(() => {
      document.getElementById(id)?.focus();
      setLastAddedRowId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastAddedRowId]);

  const addRow = useCallback(() => {
    const newRow = createEmptyRow(defaultType);
    setRows((prev) => [...prev, newRow]);
    setLastAddedRowId(newRow.id);
  }, [defaultType]);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<PendingRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const duplicateIds = useMemo(() => {
    const existingNames = new Set(categories.map((c) => c.name.trim().toLowerCase()));
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
  }, [rows, categories]);

  const submit = useCallback(() => {
    const valid = rows.filter((r) => r.name.trim() && !duplicateIds.has(r.id));
    if (!valid.length) return;
    valid.forEach((r) => addCategory({ name: r.name.trim(), type: r.type }));
    setRows([createEmptyRow(defaultType)]);
  }, [rows, duplicateIds, addCategory, defaultType]);

  // Only enable Submit when every row with a name is also valid (no half-filled rows)
  const hasValidRows = rows.some((r) => r.name.trim() && !duplicateIds.has(r.id));
  const hasIncompleteRows = rows.some((r) => r.name.trim() && !r.type);
  const canSubmit = hasValidRows && !hasIncompleteRows;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Add categories</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Add categories with a name and type. They appear in the Captured Goods view and the Add Items dropdown.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5">
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
                          onChange={(e) => updateRow(row.id, { type: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Tab") {
                              e.preventDefault();
                              addRow();
                            }
                          }}
                          className={cn(inputClass, "min-w-[8rem] cursor-pointer")}
                        >
                          {!row.type && <option value="">Select type</option>}
                          {goodTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
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
                <Button variant="outline" size="sm" onClick={() => setRows([createEmptyRow(defaultType)])}>
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

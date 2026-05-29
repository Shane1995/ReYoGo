import { useState, useCallback, useEffect, useMemo } from 'react';
import { PlusIcon, ChevronDownIcon } from 'lucide-react';
import { Button, PageHeader } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { INVENTORY_TYPES, InventoryType } from '@reyogo/types';
import { useInventory } from '../CapturedInventory/Context/InventoryContext';
import type { TypeValue } from '../CapturedInventory/types';
import { cn } from '@reyogo/ui';
import { useEntities } from '@/Context/EntityContext';

const inputClass = cn(
  'h-8 w-full rounded-md border border-input bg-muted px-2.5 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0',
);

type Mode = 'items' | 'categories';

// --- Items ---
type ItemRow = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasure: string;
};
function emptyItemRow(): ItemRow {
  return { id: crypto.randomUUID(), name: '', categoryId: '', type: '', unitOfMeasure: '' };
}

// --- Categories ---
type CategoryRow = { id: string; name: string; type: TypeValue };
function emptyCategoryRow(): CategoryRow {
  return { id: crypto.randomUUID(), name: '', type: InventoryType.Food };
}

export default function AddInventoryPage() {
  const { entities } = useEntities();
  const { categories, items, units, addItem, addCategory } = useInventory();

  const [mode, setMode] = useState<Mode>('items');
  const [venueId, setVenueId] = useState(() => (entities.length === 1 ? entities[0]!.id : ''));
  const [itemRows, setItemRows] = useState<ItemRow[]>([emptyItemRow()]);
  const [catRows, setCatRows] = useState<CategoryRow[]>([emptyCategoryRow()]);
  const [lastFocusId, setLastFocusId] = useState<string | null>(null);

  const namedCategories = categories.filter((c) => c.name.trim());
  const categoryTypes = Array.from(new Set(namedCategories.map((c) => c.type)));

  useEffect(() => {
    if (entities.length === 1 && !venueId) setVenueId(entities[0]!.id);
  }, [entities, venueId]);

  // Focus newly added row's name input
  useEffect(() => {
    if (!lastFocusId) return;
    const t = setTimeout(() => {
      document.getElementById(lastFocusId)?.focus();
      setLastFocusId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastFocusId]);

  // --- Item logic ---
  const addItemRow = useCallback(() => {
    const r = emptyItemRow();
    setItemRows((prev) => [...prev, r]);
    setLastFocusId(`row-name-${r.id}`);
  }, []);

  const removeItemRow = useCallback(
    (id: string) => setItemRows((p) => p.filter((r) => r.id !== id)),
    [],
  );

  const updateItemRow = useCallback(
    (id: string, u: Partial<ItemRow>) =>
      setItemRows((p) => p.map((r) => (r.id === id ? { ...r, ...u } : r))),
    [],
  );

  const itemDupes = useMemo(() => {
    const existing = new Set(
      items
        .filter((i) => !venueId || i.entityId === venueId)
        .map((i) => i.name.trim().toLowerCase()),
    );
    const seen = new Map<string, string>();
    const dupes = new Set<string>();
    for (const row of itemRows) {
      const key = row.name.trim().toLowerCase();
      if (!key) continue;
      if (existing.has(key)) {
        dupes.add(row.id);
      } else if (seen.has(key)) {
        dupes.add(row.id);
        dupes.add(seen.get(key)!);
      } else seen.set(key, row.id);
    }
    return dupes;
  }, [itemRows, items, venueId]);

  const submitItems = useCallback(() => {
    const valid = itemRows.filter(
      (r) => r.name.trim() && r.categoryId && r.unitOfMeasure && !itemDupes.has(r.id),
    );
    if (!valid.length || !venueId) return;
    valid.forEach((r) =>
      addItem({
        name: r.name.trim(),
        categoryId: r.categoryId,
        type: r.type,
        unitOfMeasure: r.unitOfMeasure || undefined,
        entityId: venueId,
      }),
    );
    setItemRows([emptyItemRow()]);
  }, [itemRows, itemDupes, addItem, venueId]);

  const namedItemRows = itemRows.filter((r) => r.name.trim());
  const canSubmitItems =
    namedItemRows.some((r) => r.categoryId && r.unitOfMeasure && !itemDupes.has(r.id)) &&
    !namedItemRows.some((r) => !r.categoryId || !r.unitOfMeasure) &&
    !!venueId;

  // --- Category logic ---
  const addCatRow = useCallback(() => {
    const r = emptyCategoryRow();
    setCatRows((prev) => [...prev, r]);
    setLastFocusId(`row-name-${r.id}`);
  }, []);

  const removeCatRow = useCallback(
    (id: string) => setCatRows((p) => p.filter((r) => r.id !== id)),
    [],
  );

  const updateCatRow = useCallback(
    (id: string, u: Partial<CategoryRow>) =>
      setCatRows((p) => p.map((r) => (r.id === id ? { ...r, ...u } : r))),
    [],
  );

  const catDupes = useMemo(() => {
    const existing = new Set(categories.map((c) => c.name.trim().toLowerCase()));
    const seen = new Map<string, string>();
    const dupes = new Set<string>();
    for (const row of catRows) {
      const key = row.name.trim().toLowerCase();
      if (!key) continue;
      if (existing.has(key)) {
        dupes.add(row.id);
      } else if (seen.has(key)) {
        dupes.add(row.id);
        dupes.add(seen.get(key)!);
      } else seen.set(key, row.id);
    }
    return dupes;
  }, [catRows, categories]);

  const submitCats = useCallback(() => {
    const valid = catRows.filter((r) => r.name.trim() && !catDupes.has(r.id));
    if (!valid.length) return;
    valid.forEach((r) => addCategory({ name: r.name.trim(), type: r.type }));
    setCatRows([emptyCategoryRow()]);
  }, [catRows, catDupes, addCategory]);

  const canSubmitCats = catRows.some((r) => r.name.trim() && !catDupes.has(r.id));

  const venueName = entities.find((e) => e.id === venueId)?.name;
  const noVenue = mode === 'items' && entities.length > 1 && !venueId;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Add inventory" description="Add items and categories in bulk." />

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5 space-y-3">
          {/* Mode toggle */}
          <div className="inline-flex items-center rounded-lg border border-[var(--nav-border)] bg-muted/20 p-0.5 gap-0.5">
            {(['items', 'categories'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
                  mode === m
                    ? 'bg-[var(--nav-active-border)]/15 text-[var(--nav-active-border)] shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'items' ? 'Items' : 'Categories'}
              </button>
            ))}
          </div>

          {/* Venue context bar — items mode only, multi-entity only */}
          {mode === 'items' && entities.length > 1 && (
            <div className="flex items-center gap-3 rounded-lg border border-[var(--nav-active-border)]/30 bg-[var(--nav-active-border)]/5 px-4 py-2.5">
              <span className="text-xs text-muted-foreground shrink-0">Adding items to</span>
              <div className="relative">
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className={cn(
                    'appearance-none h-7 rounded-md border border-[var(--nav-active-border)]/40 bg-transparent',
                    'pl-3 pr-7 text-sm font-medium text-foreground cursor-pointer',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50',
                    !venueId && 'text-muted-foreground',
                  )}
                >
                  <option value="">Choose a venue…</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              </div>
              {venueName && (
                <span className="text-xs text-[var(--nav-active-border)] font-medium">
                  ✓ {venueName}
                </span>
              )}
            </div>
          )}

          {/* Table */}
          <div
            className={cn(
              'rounded-lg border border-[var(--nav-border)] bg-background',
              noVenue && 'opacity-40 pointer-events-none',
            )}
          >
            {mode === 'items' ? (
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
                  {itemRows.map((row) => {
                    const isDupe = itemDupes.has(row.id);
                    const hasName = !!row.name.trim();
                    const isIncomplete = hasName && !row.categoryId;
                    const missingUnit = hasName && !row.unitOfMeasure;
                    return (
                      <TableRow
                        key={row.id}
                        className="border-[var(--nav-border)] hover:bg-muted/30"
                      >
                        <TableCell className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <input
                              id={`row-name-${row.id}`}
                              value={row.name}
                              onChange={(e) => updateItemRow(row.id, { name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addItemRow();
                              }}
                              className={cn(
                                inputClass,
                                'min-w-[10rem]',
                                isDupe && 'border-destructive focus:ring-destructive/50',
                              )}
                              placeholder="Item name"
                            />
                            {isDupe && (
                              <span className="shrink-0 text-xs text-destructive">
                                Already exists
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <select
                            value={row.categoryId}
                            onChange={(e) => {
                              const categoryId = e.target.value;
                              const cat = namedCategories.find((c) => c.id === categoryId);
                              updateItemRow(
                                row.id,
                                cat ? { categoryId, type: cat.type } : { categoryId },
                              );
                            }}
                            className={cn(
                              inputClass,
                              'min-w-[10rem] cursor-pointer',
                              isIncomplete && 'border-destructive focus:ring-destructive/50',
                            )}
                          >
                            <option value="">Select a category…</option>
                            {categoryTypes.map((type) => (
                              <optgroup key={type} label={type}>
                                {namedCategories
                                  .filter((c) => c.type === type)
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
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
                              updateItemRow(row.id, { unitOfMeasure: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                addItemRow();
                              }
                            }}
                            className={cn(
                              inputClass,
                              'min-w-[6rem] cursor-pointer',
                              missingUnit && 'border-destructive focus:ring-destructive/50',
                            )}
                          >
                            <option value="">Select a unit…</option>
                            {units.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                          {missingUnit && (
                            <span className="text-xs text-destructive mt-0.5 block">Required</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeItemRow(row.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                    <TableHead className="font-medium text-foreground">Name</TableHead>
                    <TableHead className="font-medium text-foreground">Type</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catRows.map((row) => {
                    const isDupe = catDupes.has(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        className="border-[var(--nav-border)] hover:bg-muted/30"
                      >
                        <TableCell className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <input
                              id={`row-name-${row.id}`}
                              value={row.name}
                              onChange={(e) => updateCatRow(row.id, { name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addCatRow();
                              }}
                              className={cn(
                                inputClass,
                                'min-w-[10rem]',
                                isDupe && 'border-destructive focus:ring-destructive/50',
                              )}
                              placeholder="Category name"
                            />
                            {isDupe && (
                              <span className="shrink-0 text-xs text-destructive">
                                Already exists
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <select
                            value={row.type}
                            onChange={(e) =>
                              updateCatRow(row.id, { type: e.target.value as TypeValue })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                addCatRow();
                              }
                            }}
                            className={cn(inputClass, 'min-w-[8rem] cursor-pointer')}
                          >
                            {INVENTORY_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
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
                            onClick={() => removeCatRow(row.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Footer */}
            <div className="border-t border-[var(--nav-border)] bg-muted/10">
              <div className="flex justify-end px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={mode === 'items' ? addItemRow : addCatRow}
                  className="gap-1.5"
                >
                  <PlusIcon className="size-4" aria-hidden />
                  Add row
                </Button>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--nav-border)] px-3 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    mode === 'items'
                      ? setItemRows([emptyItemRow()])
                      : setCatRows([emptyCategoryRow()])
                  }
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={mode === 'items' ? submitItems : submitCats}
                  disabled={mode === 'items' ? !canSubmitItems : !canSubmitCats}
                >
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

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button, PageHeader } from '@reyogo/ui';
import { InventoryType } from '@reyogo/types';
import { useInventory } from '../CapturedInventory/Context/InventoryContext';
import { useEntities } from '@/Context/EntityContext';
import { cn } from '@reyogo/ui';
import { ItemsSection } from './components/ItemsSection';
import type { ItemRow } from './components/ItemsSection';
import { CategoriesSection } from './components/CategoriesSection';
import type { CategoryRow } from './components/CategoriesSection';

type Mode = 'items' | 'categories';

function emptyItemRow(): ItemRow {
  return { id: crypto.randomUUID(), name: '', categoryId: '', type: '', unitOfMeasureId: '' };
}

function emptyCategoryRow(): CategoryRow {
  return { id: crypto.randomUUID(), name: '', type: InventoryType.Food };
}

export default function AddInventoryPage() {
  const { categories, items, unitOptions, addItem, addCategory, inventoryTypes } = useInventory();
  const { selectedEntityId: entityId } = useEntities();

  const [mode, setMode] = useState<Mode>('items');
  const [itemRows, setItemRows] = useState<ItemRow[]>([emptyItemRow()]);
  const [catRows, setCatRows] = useState<CategoryRow[]>([emptyCategoryRow()]);
  const [lastFocusId, setLastFocusId] = useState<string | null>(null);

  const namedCategories = categories
    .filter((c) => c.name.trim())
    .sort((a, b) => a.name.localeCompare(b.name));
  const categoryTypes = inventoryTypes.filter((t) => namedCategories.some((c) => c.type === t));

  useEffect(() => {
    if (!lastFocusId) return;
    const t = setTimeout(() => {
      document.getElementById(lastFocusId)?.focus();
      setLastFocusId(null);
    }, 50);
    return () => clearTimeout(t);
  }, [lastFocusId]);

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
    const existing = new Set(items.map((i) => i.name.trim().toLowerCase()));
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
  }, [itemRows, items]);

  const submitItems = useCallback(() => {
    if (!entityId) return;
    const valid = itemRows.filter(
      (r) => r.name.trim() && r.categoryId && r.unitOfMeasureId && !itemDupes.has(r.id),
    );
    if (!valid.length) return;
    valid.forEach((r) =>
      addItem({
        name: r.name.trim(),
        categoryId: r.categoryId,
        type: r.type,
        unitOfMeasureId: r.unitOfMeasureId || null,
        entityId,
      }),
    );
    setItemRows([emptyItemRow()]);
  }, [itemRows, itemDupes, addItem, entityId]);

  const namedItemRows = itemRows.filter((r) => r.name.trim());
  const canSubmitItems =
    !!entityId &&
    namedItemRows.some((r) => r.categoryId && r.unitOfMeasureId && !itemDupes.has(r.id));
  const hasIncompleteItemRows = namedItemRows.some((r) => !r.categoryId || !r.unitOfMeasureId);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Add inventory" description="Add items and categories in bulk." />

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5 space-y-3">
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

          <div className="rounded-lg border border-[var(--nav-border)] bg-background">
            {mode === 'items' ? (
              <ItemsSection
                itemRows={itemRows}
                itemDupes={itemDupes}
                namedCategories={namedCategories}
                categoryTypes={categoryTypes}
                unitOptions={unitOptions}
                onUpdateRow={updateItemRow}
                onRemoveRow={removeItemRow}
                onAddRow={addItemRow}
              />
            ) : (
              <CategoriesSection
                catRows={catRows}
                catDupes={catDupes}
                onUpdateRow={updateCatRow}
                onRemoveRow={removeCatRow}
                onAddRow={addCatRow}
              />
            )}

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
              <div className="flex justify-end gap-2 border-t border-[var(--nav-border)] px-3 py-2 items-center">
                {mode === 'items' && hasIncompleteItemRows && (
                  <p className="text-xs text-muted-foreground mr-auto">
                    Incomplete rows will be skipped
                  </p>
                )}
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

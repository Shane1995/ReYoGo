import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button, PageHeader } from '@reyogo/ui';
import { useInventory } from '../CapturedInventory/Context/InventoryContext';
import { useEntities } from '@/Context/EntityContext';
import { cn } from '@reyogo/ui';
import { ItemsSection } from './components/ItemsSection';
import { CategoriesSection } from './components/CategoriesSection';
import { useItemRows } from './hooks/useItemRows';
import { useCategoryRows } from './hooks/useCategoryRows';

type Mode = 'items' | 'categories';

function ModeTabBar({ mode, onSelect }: { mode: Mode; onSelect: (m: Mode) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[var(--nav-border)] bg-muted/20 p-0.5 gap-0.5">
      {(['items', 'categories'] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onSelect(m)}
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
  );
}

function TableActionBar({
  mode,
  hasIncompleteItemRows,
  canSubmitItems,
  canSubmitCats,
  onAddRow,
  onClear,
  onSubmit,
}: {
  mode: Mode;
  hasIncompleteItemRows: boolean;
  canSubmitItems: boolean;
  canSubmitCats: boolean;
  onAddRow: () => void;
  onClear: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/10">
      <div className="flex justify-end px-3 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={onAddRow} className="gap-1.5">
          <PlusIcon className="size-4" aria-hidden />
          Add row
        </Button>
      </div>
      <div className="flex justify-end gap-2 border-t border-[var(--nav-border)] px-3 py-2 items-center">
        {mode === 'items' && hasIncompleteItemRows && (
          <p className="text-xs text-muted-foreground mr-auto">Incomplete rows will be skipped</p>
        )}
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={mode === 'items' ? !canSubmitItems : !canSubmitCats}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default function AddInventoryPage() {
  const { categories, items, unitOptions, addItem, addCategory, inventoryTypes } = useInventory();
  const { selectedEntityId: entityId } = useEntities();
  const [mode, setMode] = useState<Mode>('items');

  const namedCategories = categories
    .filter((c) => c.name.trim())
    .sort((a, b) => a.name.localeCompare(b.name));
  const categoryTypes = inventoryTypes.filter((t) => namedCategories.some((c) => c.type === t));

  const {
    itemRows,
    itemDupes,
    canSubmitItems,
    hasIncompleteItemRows,
    addItemRow,
    removeItemRow,
    updateItemRow,
    submitItems,
    clearItemRows,
  } = useItemRows({ items, entityId, addItem });
  const {
    catRows,
    catDupes,
    canSubmitCats,
    addCatRow,
    removeCatRow,
    updateCatRow,
    submitCats,
    clearCatRows,
  } = useCategoryRows({ categories, addCategory });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Add inventory" description="Add items and categories in bulk." />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5 space-y-3">
          <ModeTabBar mode={mode} onSelect={setMode} />
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
            <TableActionBar
              mode={mode}
              hasIncompleteItemRows={hasIncompleteItemRows}
              canSubmitItems={canSubmitItems}
              canSubmitCats={canSubmitCats}
              onAddRow={mode === 'items' ? addItemRow : addCatRow}
              onClear={mode === 'items' ? clearItemRows : clearCatRows}
              onSubmit={mode === 'items' ? submitItems : submitCats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

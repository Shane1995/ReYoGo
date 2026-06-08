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

function useAddInventoryData() {
  const { categories, items, unitOptions, addItem, addCategory, inventoryTypes } = useInventory();
  const { selectedEntityId: entityId } = useEntities();
  const namedCategories = categories
    .filter((c) => c.name.trim())
    .sort((a, b) => a.name.localeCompare(b.name));
  const categoryTypes = inventoryTypes.filter((t) => namedCategories.some((c) => c.type === t));
  const items_ = useItemRows({ items, entityId, addItem });
  const cats_ = useCategoryRows({ categories, addCategory });
  return { namedCategories, categoryTypes, unitOptions, items_, cats_ };
}

type ItemRows = ReturnType<typeof useItemRows>;
type CategoryRows = ReturnType<typeof useCategoryRows>;

function ModeSection({
  mode,
  itemRows,
  catRows,
  namedCategories,
  categoryTypes,
  unitOptions,
}: {
  mode: Mode;
  itemRows: ItemRows;
  catRows: CategoryRows;
  namedCategories: ReturnType<typeof useAddInventoryData>['namedCategories'];
  categoryTypes: ReturnType<typeof useAddInventoryData>['categoryTypes'];
  unitOptions: ReturnType<typeof useAddInventoryData>['unitOptions'];
}) {
  if (mode === 'items') {
    return (
      <ItemsSection
        itemRows={itemRows.itemRows}
        itemDupes={itemRows.itemDupes}
        namedCategories={namedCategories}
        categoryTypes={categoryTypes}
        unitOptions={unitOptions}
        onUpdateRow={itemRows.updateItemRow}
        onRemoveRow={itemRows.removeItemRow}
        onAddRow={itemRows.addItemRow}
      />
    );
  }
  return (
    <CategoriesSection
      catRows={catRows.catRows}
      catDupes={catRows.catDupes}
      onUpdateRow={catRows.updateCatRow}
      onRemoveRow={catRows.removeCatRow}
      onAddRow={catRows.addCatRow}
    />
  );
}

function tableActionsFor(
  mode: Mode,
  itemRows: ItemRows,
  catRows: CategoryRows,
): { onAddRow: () => void; onClear: () => void; onSubmit: () => void } {
  if (mode === 'items') {
    return {
      onAddRow: itemRows.addItemRow,
      onClear: itemRows.clearItemRows,
      onSubmit: itemRows.submitItems,
    };
  }
  return {
    onAddRow: catRows.addCatRow,
    onClear: catRows.clearCatRows,
    onSubmit: catRows.submitCats,
  };
}

export default function AddInventoryPage() {
  const [mode, setMode] = useState<Mode>('items');
  const {
    namedCategories,
    categoryTypes,
    unitOptions,
    items_: i,
    cats_: c,
  } = useAddInventoryData();

  const tableActions = tableActionsFor(mode, i, c);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Add inventory" description="Add items and categories in bulk." />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5 space-y-3">
          <ModeTabBar mode={mode} onSelect={setMode} />
          <div className="rounded-lg border border-[var(--nav-border)] bg-background">
            <ModeSection
              mode={mode}
              itemRows={i}
              catRows={c}
              namedCategories={namedCategories}
              categoryTypes={categoryTypes}
              unitOptions={unitOptions}
            />
            <TableActionBar
              mode={mode}
              hasIncompleteItemRows={i.hasIncompleteItemRows}
              canSubmitItems={i.canSubmitItems}
              canSubmitCats={c.canSubmitCats}
              onAddRow={tableActions.onAddRow}
              onClear={tableActions.onClear}
              onSubmit={tableActions.onSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

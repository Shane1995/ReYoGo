import { useState } from 'react';
import { PageHeader } from '@reyogo/ui';
import { ModeTabBar } from './components/ModeTabBar';
import { TableActionBar } from './components/TableActionBar';
import { ModeSection } from './components/ModeSection';
import { useAddInventoryData } from './hooks/useAddInventoryData';
import { tableActionsFor } from './utils/tableActionsFor';
import type { Mode } from './types';

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

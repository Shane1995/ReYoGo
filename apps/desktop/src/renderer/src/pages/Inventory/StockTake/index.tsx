import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@reyogo/ui';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import { useStocktakeSession } from './hooks/useStocktakeSession';
import { useCountEntries } from './hooks/useCountEntries';
import { countSheetRowsOf } from './utils/countSheetRowsOf';
import { filterBucketsByName } from './utils/filterBucketsByName';
import { stockTakeSummaryOf } from './utils/stockTakeSummaryOf';
import { SessionPicker } from './components/SessionPicker';
import { ActiveSessionPanel } from './components/ActiveSessionPanel';
import { CompleteCountDialog } from './components/CompleteCountDialog';

export default function StockTakePage() {
  const { items, categories } = useInventory();
  const [lastCostByItem, setLastCostByItem] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const session = useStocktakeSession();
  const entries = useCountEntries(session.currentSession);

  useEffect(() => {
    invoiceService.getLastUnitPrices().then((prices) => {
      setLastCostByItem(
        Object.fromEntries(Object.entries(prices).map(([itemId, p]) => [itemId, p.exclVat])),
      );
    });
  }, []);

  const buckets = useMemo(
    () => countSheetRowsOf(items, categories, entries.countedQtyByItem, lastCostByItem),
    [items, categories, entries.countedQtyByItem, lastCostByItem],
  );
  const visibleBuckets = useMemo(() => filterBucketsByName(buckets, search), [buckets, search]);
  const summary = useMemo(() => stockTakeSummaryOf(buckets), [buckets]);
  const readOnly = session.currentSession?.status !== 'open';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Stock Take"
        description="Create a stock sheet, count items by category, and value what you counted."
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="max-w-4xl px-6 py-6 flex flex-col gap-4">
          <SessionPicker
            sessions={session.sessions}
            currentSessionId={session.currentSession?.id}
            onSelect={session.selectSession}
            onCreate={() => session.createSession()}
          />
          {session.currentSession ? (
            <ActiveSessionPanel
              buckets={visibleBuckets}
              readOnly={readOnly}
              onQtyChange={entries.setQty}
              summary={summary}
              search={search}
              onSearchChange={setSearch}
              saving={session.saving}
              completing={session.completing}
              lines={entries.lines}
              onSaveDraft={session.saveDraft}
              onCompleteClick={() => setConfirmingComplete(true)}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Create a stock sheet to start counting.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Count items by category, and we&apos;ll value the count using last cost.
              </p>
            </div>
          )}
        </div>
      </div>
      <CompleteCountDialog
        open={confirmingComplete}
        completing={session.completing}
        uncountedCount={summary.totalCount - summary.countedCount}
        totalValue={summary.totalValue}
        onClose={() => setConfirmingComplete(false)}
        onConfirm={async () => {
          await session.complete(entries.lines);
          setConfirmingComplete(false);
        }}
      />
    </div>
  );
}

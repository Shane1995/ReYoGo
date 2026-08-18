import { useEffect, useMemo, useState } from 'react';
import { Button, PageHeader, StatCard, cn } from '@reyogo/ui';
import { ClipboardCheckIcon, LayersIcon, SearchIcon, WalletIcon } from 'lucide-react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import { formatZAR } from '@/utils/format';
import { useStocktakeSession } from './hooks/useStocktakeSession';
import { useCountEntries } from './hooks/useCountEntries';
import { countSheetRowsOf } from './utils/countSheetRowsOf';
import { filterBucketsByName } from './utils/filterBucketsByName';
import { stockTakeSummaryOf } from './utils/stockTakeSummaryOf';
import { SessionPicker } from './components/SessionPicker';
import { CountSheetTable } from './components/CountSheetTable';
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
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Items counted"
                  value={`${summary.countedCount} / ${summary.totalCount}`}
                  icon={ClipboardCheckIcon}
                />
                <StatCard label="Categories" value={summary.categoryCount} icon={LayersIcon} />
                <StatCard
                  label="Counted value"
                  value={formatZAR(summary.totalValue)}
                  icon={WalletIcon}
                />
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search items…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    'h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm',
                    'placeholder:text-muted-foreground/50',
                  )}
                />
              </div>
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <CountSheetTable
                  buckets={visibleBuckets}
                  readOnly={readOnly}
                  onQtyChange={entries.setQty}
                />
              </div>
              {!readOnly && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={session.saving}
                    onClick={() => session.saveDraft(entries.lines)}
                  >
                    {session.saving ? 'Saving…' : 'Save Progress'}
                  </Button>
                  <Button disabled={session.completing} onClick={() => setConfirmingComplete(true)}>
                    Complete Count
                  </Button>
                </div>
              )}
            </>
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

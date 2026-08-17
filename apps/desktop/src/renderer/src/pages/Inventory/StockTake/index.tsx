import { useEffect, useState } from 'react';
import { Button, PageHeader } from '@reyogo/ui';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import { useStocktakeSession } from './hooks/useStocktakeSession';
import { useCountEntries } from './hooks/useCountEntries';
import { countSheetRowsOf } from './utils/countSheetRowsOf';
import { SessionPicker } from './components/SessionPicker';
import { CountSheetTable } from './components/CountSheetTable';

export default function StockTakePage() {
  const { items, categories } = useInventory();
  const [lastCostByItem, setLastCostByItem] = useState<Record<string, number>>({});
  const session = useStocktakeSession();
  const entries = useCountEntries(session.currentSession);

  useEffect(() => {
    invoiceService.getLastUnitPrices().then((prices) => {
      setLastCostByItem(
        Object.fromEntries(Object.entries(prices).map(([itemId, p]) => [itemId, p.exclVat])),
      );
    });
  }, []);

  const buckets = countSheetRowsOf(items, categories, entries.countedQtyByItem, lastCostByItem);
  const readOnly = session.currentSession?.status !== 'open';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Stock Take"
        description="Create a stock sheet, count items by category, and value what you counted."
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="max-w-3xl px-6 py-6 flex flex-col gap-4">
          <SessionPicker
            sessions={session.sessions}
            currentSessionId={session.currentSession?.id}
            onSelect={session.selectSession}
            onCreate={() => session.createSession()}
          />
          {session.currentSession ? (
            <>
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <CountSheetTable
                  buckets={buckets}
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
                  <Button
                    disabled={session.completing}
                    onClick={() => session.complete(entries.lines)}
                  >
                    {session.completing ? 'Completing…' : 'Complete Count'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Create a stock sheet to start counting.</p>
          )}
        </div>
      </div>
    </div>
  );
}

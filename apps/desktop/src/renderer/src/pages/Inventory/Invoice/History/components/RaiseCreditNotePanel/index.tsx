import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import type { ICapturedInvoiceWithLines, ISaveCreditNotePayload } from '@reyogo/types';

type CreditNoteLine = {
  lineId: string;
  itemId: string;
  itemNameSnapshot: string;
  originalQty: number;
  unitCost: number;
  qty: number;
  selected: boolean;
  isVatable: boolean;
};

type Props = {
  invoice: ICapturedInvoiceWithLines;
  onConfirm: (payload: ISaveCreditNotePayload) => void;
  onCancel: () => void;
};

type Step = 'edit' | 'confirm';

function buildInitialLines(invoice: ICapturedInvoiceWithLines): CreditNoteLine[] {
  return invoice.lines.map((l) => ({
    lineId: l.id,
    itemId: l.itemId,
    itemNameSnapshot: l.itemNameSnapshot,
    originalQty: l.quantity,
    unitCost: l.quantity > 0 ? l.totalVatExclude / l.quantity : 0,
    qty: l.quantity,
    selected: true,
    isVatable: l.isVatable,
  }));
}

function activeLines(lines: CreditNoteLine[]) {
  return lines.filter((l) => l.selected && l.qty > 0);
}

export function RaiseCreditNotePanel({ invoice, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState<Step>('edit');
  const [lines, setLines] = useState<CreditNoteLine[]>(() => buildInitialLines(invoice));

  const setQty = useCallback((lineId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId ? { ...l, qty: Math.min(Math.max(0, qty), l.originalQty) } : l,
      ),
    );
  }, []);

  const toggleSelected = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, selected: !l.selected } : l)),
    );
  }, []);

  const canContinue = activeLines(lines).length > 0;

  const handleConfirm = useCallback(() => {
    const creditLines = activeLines(lines);
    const payload: ISaveCreditNotePayload = {
      id: crypto.randomUUID(),
      sourceInvoiceId: invoice.id,
      entityId: invoice.entityId,
      supplierId: invoice.supplierId,
      invoiceNumber: `CN-${invoice.invoiceNumber}`,
      vatMode: invoice.vatMode,
      vatRate: invoice.vatRate,
      lines: creditLines.map((l) => ({
        id: crypto.randomUUID(),
        itemId: l.itemId,
        itemNameSnapshot: l.itemNameSnapshot,
        quantity: l.qty,
        isVatable: l.isVatable,
        totalVatExclude: l.qty * l.unitCost,
      })),
    };
    onConfirm(payload);
  }, [lines, invoice, onConfirm]);

  const cell = 'px-3 py-2 text-sm';
  const th =
    'px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 text-left';

  if (step === 'confirm') {
    const confirmed = activeLines(lines);
    const total = confirmed.reduce((s, l) => s + l.qty * l.unitCost, 0);
    return (
      <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4 space-y-4">
        <p className="text-sm font-medium">Confirm credit note</p>
        <p className="text-xs text-muted-foreground">
          The following stock will be reduced as of today. This cannot be undone.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className={th}>Item</th>
              <th className={`${th} text-right`}>Qty</th>
              <th className={`${th} text-right`}>Value (excl. VAT)</th>
            </tr>
          </thead>
          <tbody>
            {confirmed.map((l) => (
              <tr key={l.lineId} className="border-b border-border/50">
                <td className={cell}>{l.itemNameSnapshot}</td>
                <td className={`${cell} text-right tabular-nums`}>{l.qty}</td>
                <td className={`${cell} text-right tabular-nums font-mono`}>
                  {(l.qty * l.unitCost).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className={`${cell} text-right font-medium`}>
                Total
              </td>
              <td className={`${cell} text-right font-mono font-semibold`}>{total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep('edit')}>
            Back
          </Button>
          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4 space-y-4">
      <p className="text-sm font-medium">Raise credit note against {invoice.invoiceNumber}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={th} />
            <th className={th}>Item</th>
            <th className={`${th} text-right`}>Original qty</th>
            <th className={`${th} text-right`}>Credit qty</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr
              key={l.lineId}
              className={`border-b border-border/50 ${!l.selected ? 'opacity-40' : ''}`}
            >
              <td className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={l.selected}
                  onChange={() => toggleSelected(l.lineId)}
                  className="size-3.5 accent-[var(--primary)]"
                />
              </td>
              <td className={cell}>{l.itemNameSnapshot}</td>
              <td className={`${cell} text-right tabular-nums text-muted-foreground`}>
                {l.originalQty}
              </td>
              <td className={`${cell} text-right`}>
                <input
                  type="number"
                  min={0}
                  max={l.originalQty}
                  step={1}
                  value={l.qty}
                  disabled={!l.selected}
                  onChange={(e) => setQty(l.lineId, Number(e.target.value))}
                  className="w-20 h-7 rounded border border-input bg-background px-2 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 disabled:opacity-40"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" disabled={!canContinue} onClick={() => setStep('confirm')}>
          Continue
        </Button>
      </div>
    </div>
  );
}

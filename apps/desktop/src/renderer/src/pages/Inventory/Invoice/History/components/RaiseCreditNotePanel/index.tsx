import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import type { ICapturedInvoiceWithLines, ISaveCreditNotePayload } from '@reyogo/types';
import { Checkbox } from '@/components/Checkbox';
import { formatMoney } from '../../../utils/formatMoney';

type CreditLine = {
  lineId: string;
  itemId: string;
  itemNameSnapshot: string;
  unitOfMeasure?: string | null;
  isVatable: boolean;
  origQty: number;
  origUnitPrice: number;
  creditQty: number;
  creditPrice: number;
  selected: boolean;
};

type Props = {
  invoice: ICapturedInvoiceWithLines;
  onConfirm: (payload: ISaveCreditNotePayload) => void;
  onCancel: () => void;
};

const STEP_EDIT = 'edit' as const;
const STEP_CONFIRM = 'confirm' as const;
type Step = typeof STEP_EDIT | typeof STEP_CONFIRM;

const inputCls =
  'w-20 h-7 rounded border border-input bg-background px-2 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-40';

function priceCls(modified: boolean): string {
  return modified ? `${inputCls} ring-1 ring-amber-400/50` : inputCls;
}

function buildInitialLines(invoice: ICapturedInvoiceWithLines): CreditLine[] {
  return invoice.lines.map((l) => {
    const origUnitPrice = l.quantity > 0 ? l.totalVatExclude / l.quantity : 0;
    return {
      lineId: l.id,
      itemId: l.itemId,
      itemNameSnapshot: l.itemNameSnapshot,
      unitOfMeasure: l.unitOfMeasure,
      isVatable: l.isVatable,
      origQty: l.quantity,
      origUnitPrice,
      creditQty: l.quantity,
      creditPrice: origUnitPrice,
      selected: true,
    };
  });
}

function getActiveLines(lines: CreditLine[]): CreditLine[] {
  return lines.filter((l) => l.selected && l.creditQty > 0);
}

const th =
  'px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 text-left';
const td = 'px-3 py-2 text-sm';

export function RaiseCreditNotePanel({ invoice, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState<Step>(STEP_EDIT);
  const [lines, setLines] = useState<CreditLine[]>(() => buildInitialLines(invoice));

  const selectedCount = lines.filter((l) => l.selected).length;
  const allSelected = selectedCount === lines.length;
  const someSelected = selectedCount > 0 && selectedCount < lines.length;

  const toggleAll = useCallback(() => {
    const nextSelected = !allSelected;
    setLines((prev) => prev.map((l) => ({ ...l, selected: nextSelected })));
  }, [allSelected]);

  const toggleLine = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, selected: !l.selected } : l)),
    );
  }, []);

  const setQty = useCallback((lineId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId ? { ...l, creditQty: Math.min(Math.max(0, qty), l.origQty) } : l,
      ),
    );
  }, []);

  const setPrice = useCallback((lineId: string, price: number) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, creditPrice: Math.max(0, price) } : l)),
    );
  }, []);

  const canContinue = getActiveLines(lines).length > 0;

  const handleConfirm = useCallback(() => {
    const creditLines = getActiveLines(lines);
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
        unitOfMeasure: l.unitOfMeasure,
        quantity: l.creditQty,
        unitPrice: l.creditPrice,
        isVatable: l.isVatable,
        totalVatExclude: l.creditQty * l.creditPrice,
      })),
    };
    onConfirm(payload);
  }, [lines, invoice, onConfirm]);

  if (step === STEP_CONFIRM) {
    const confirmed = getActiveLines(lines);
    const creditTotal = confirmed.reduce((s, l) => s + l.creditQty * l.creditPrice, 0);

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
              <th className={`${th} text-right`}>Was invoiced</th>
              <th className={`${th} text-right`}>Crediting</th>
              <th className={`${th} text-right`}>Δ</th>
            </tr>
          </thead>
          <tbody>
            {confirmed.map((l) => {
              const origTotal = l.origQty * l.origUnitPrice;
              const lineTotal = l.creditQty * l.creditPrice;
              const priceChanged = l.creditPrice !== l.origUnitPrice;
              const isFreeGift = l.origUnitPrice === 0 && l.creditPrice === 0;

              return (
                <tr key={l.lineId} className="border-b border-border/50">
                  <td className={td}>{l.itemNameSnapshot}</td>
                  <td className={`${td} text-right tabular-nums text-muted-foreground font-mono`}>
                    {l.origQty} × £{formatMoney(l.origUnitPrice)} = £{formatMoney(origTotal)}
                  </td>
                  <td className={`${td} text-right tabular-nums font-mono`}>
                    {l.creditQty} ×{' '}
                    {priceChanged && <span className="text-amber-400 mr-0.5">●</span>}£
                    {formatMoney(l.creditPrice)} = £{formatMoney(lineTotal)}
                  </td>
                  <td className={`${td} text-right tabular-nums font-mono`}>
                    {isFreeGift ? (
                      <span className="text-white/40">Stock only</span>
                    ) : (
                      <span className="text-rose-400">-£{formatMoney(lineTotal)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className={`${td} text-right font-medium`}>
                Credit total
              </td>
              <td className={`${td} text-right tabular-nums font-mono text-rose-400 font-semibold`}>
                -£{formatMoney(creditTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep(STEP_EDIT)}>
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

  const editTotal = lines
    .filter((l) => l.selected)
    .reduce((s, l) => s + l.creditQty * l.creditPrice, 0);

  return (
    <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4 space-y-4">
      <p className="text-sm font-medium">Raise credit note against {invoice.invoiceNumber}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={th}>
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
            </th>
            <th className={th}>Item</th>
            <th className={`${th} text-right`}>Orig qty</th>
            <th className={`${th} text-right`}>Orig price</th>
            <th className={`${th} text-right`}>Credit qty</th>
            <th className={`${th} text-right`}>Credit price</th>
            <th className={`${th} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr
              key={l.lineId}
              className={`border-b border-border/50 ${!l.selected ? 'opacity-40' : ''}`}
            >
              <td className="px-3 py-2 w-8">
                <Checkbox checked={l.selected} onChange={() => toggleLine(l.lineId)} />
              </td>
              <td className={td}>{l.itemNameSnapshot}</td>
              <td className={`${td} text-right tabular-nums text-muted-foreground`}>{l.origQty}</td>
              <td className={`${td} text-right tabular-nums text-muted-foreground font-mono`}>
                £{formatMoney(l.origUnitPrice)}
              </td>
              <td className={`${td} text-right`}>
                <input
                  type="number"
                  min={0}
                  max={l.origQty}
                  step={1}
                  value={l.creditQty}
                  disabled={!l.selected}
                  onChange={(e) => setQty(l.lineId, Number(e.target.value))}
                  className={inputCls}
                />
              </td>
              <td className={`${td} text-right`}>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={l.creditPrice}
                  disabled={!l.selected}
                  onChange={(e) => setPrice(l.lineId, Number(e.target.value))}
                  className={priceCls(l.creditPrice !== l.origUnitPrice)}
                />
              </td>
              <td className={`${td} text-right tabular-nums font-mono`}>
                {l.selected ? `£${formatMoney(l.creditQty * l.creditPrice)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Credit total:{' '}
          <span className="font-mono font-medium text-foreground">£{formatMoney(editTotal)}</span>
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canContinue} onClick={() => setStep(STEP_CONFIRM)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

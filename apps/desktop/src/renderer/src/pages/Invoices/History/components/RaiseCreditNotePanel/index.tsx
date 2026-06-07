import { useState, useCallback } from 'react';
import type { ICapturedInvoiceWithLines, ISaveCreditNotePayload } from '@reyogo/types';
import { ConfirmStep } from './components/ConfirmStep';
import { EditStep } from './components/EditStep';

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
  isFreeGift: boolean;
};

type Props = {
  invoice: ICapturedInvoiceWithLines;
  onConfirm: (payload: ISaveCreditNotePayload) => void;
  onCancel: () => void;
};

const STEP_EDIT = 'edit' as const;
const STEP_CONFIRM = 'confirm' as const;
type Step = typeof STEP_EDIT | typeof STEP_CONFIRM;

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
      isFreeGift: origUnitPrice === 0,
    };
  });
}

function getActiveLines(lines: CreditLine[]): CreditLine[] {
  return lines.filter((l) => l.selected && l.creditQty > 0);
}

function buildPayload(
  lines: CreditLine[],
  invoice: ICapturedInvoiceWithLines,
): ISaveCreditNotePayload {
  return {
    id: crypto.randomUUID(),
    sourceInvoiceId: invoice.id,
    entityId: invoice.entityId,
    supplierId: invoice.supplierId,
    invoiceNumber: `CN-${invoice.invoiceNumber}`,
    vatMode: invoice.vatMode,
    vatRate: invoice.vatRate,
    lines: lines.map((l) => ({
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
}

export function RaiseCreditNotePanel({ invoice, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState<Step>(STEP_EDIT);
  const [lines, setLines] = useState<CreditLine[]>(() => buildInitialLines(invoice));

  const selectedCount = lines.filter((l) => l.selected).length;
  const allSelected = selectedCount === lines.length;
  const someSelected = selectedCount > 0 && selectedCount < lines.length;

  const toggleAll = useCallback(() => {
    setLines((prev) => prev.map((l) => ({ ...l, selected: !allSelected })));
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

  const handleConfirm = useCallback(() => {
    onConfirm(buildPayload(getActiveLines(lines), invoice));
  }, [lines, invoice, onConfirm]);

  if (step === STEP_CONFIRM) {
    return (
      <ConfirmStep
        confirmedLines={getActiveLines(lines)}
        onBack={() => setStep(STEP_EDIT)}
        onConfirm={handleConfirm}
      />
    );
  }

  const editTotal = lines
    .filter((l) => l.selected)
    .reduce((s, l) => s + l.creditQty * l.creditPrice, 0);
  return (
    <EditStep
      invoiceNumber={invoice.invoiceNumber}
      lines={lines}
      allSelected={allSelected}
      someSelected={someSelected}
      editTotal={editTotal}
      canContinue={getActiveLines(lines).length > 0}
      onToggleAll={toggleAll}
      onToggleLine={toggleLine}
      onSetQty={setQty}
      onSetPrice={setPrice}
      onCancel={onCancel}
      onContinue={() => setStep(STEP_CONFIRM)}
    />
  );
}

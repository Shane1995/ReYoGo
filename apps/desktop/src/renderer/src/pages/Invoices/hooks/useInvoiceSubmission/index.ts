import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { invoiceService } from '@/services/invoice';
import { VatMode } from '@reyogo/types';
import type { IEntity } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { getProcessLineComputed } from '../../types';

function buildSaveLines(
  validLines: ProcessReceiptLine[],
  itemMetaMap: Map<string, { name: string }>,
  vatMode: VatMode,
  vatRate: number,
) {
  return validLines.map((line) => {
    const computed = getProcessLineComputed(line, vatMode, vatRate);
    return {
      id: line.id,
      itemId: line.itemId,
      itemNameSnapshot: itemMetaMap.get(line.itemId)?.name ?? '',
      quantity: Number(line.quantity),
      unitPrice: computed.netUnitPrice,
      isVatable: line.isVatable,
      totalVatExclude: computed.netTotal,
    };
  });
}

function buildInvoiceInput(params: {
  entityId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  vatMode: VatMode;
  vatRate: number;
  validLines: ProcessReceiptLine[];
  itemMetaMap: Map<string, { name: string }>;
}) {
  return {
    id: window.crypto.randomUUID(),
    entityId: params.entityId,
    supplierId: params.supplierId || null,
    invoiceNumber: params.invoiceNumber.trim(),
    invoiceDate: params.invoiceDate ? new Date(params.invoiceDate) : null,
    vatMode: params.vatMode,
    vatRate: params.vatRate,
    lines: buildSaveLines(params.validLines, params.itemMetaMap, params.vatMode, params.vatRate),
  };
}

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  return fallback;
}

type SubmitMessages = { success: string; failure: string };

const SAVE_MESSAGES: SubmitMessages = {
  success: 'Invoice posted',
  failure: 'Failed to save invoice',
};
const DRAFT_MESSAGES: SubmitMessages = { success: 'Draft saved', failure: 'Failed to save draft' };

async function runInvoiceSubmit(
  input: ReturnType<typeof buildInvoiceInput>,
  save: (input: ReturnType<typeof buildInvoiceInput>) => Promise<unknown>,
  messages: SubmitMessages,
  callbacks: {
    setIsSubmitting: (value: boolean) => void;
    setSaveError: (message: string | null) => void;
    onSaved: () => void;
  },
): Promise<void> {
  callbacks.setIsSubmitting(true);
  try {
    await save(input);
    callbacks.onSaved();
    toast.success(messages.success);
  } catch (e) {
    callbacks.setSaveError(errorMessage(e, messages.failure));
  } finally {
    callbacks.setIsSubmitting(false);
  }
}

type SubmissionParams = {
  selectedEntity: IEntity | null;
  entityId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  vatMode: VatMode;
  validLines: ProcessReceiptLine[];
  itemMetaMap: Map<string, { name: string }>;
  canSave: boolean;
  onSaved: () => void;
};

export function useInvoiceSubmission(params: SubmissionParams) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const validateBeforeSave = useCallback((): boolean => {
    if (!params.selectedEntity) {
      setSaveError('No entity selected. Please select a business in the top bar.');
      return false;
    }
    if (!params.canSave) {
      setSaveError(
        !params.invoiceNumber.trim()
          ? 'Invoice number is required.'
          : 'Complete all rows before saving — each row needs an item and quantity.',
      );
      return false;
    }
    setSaveError(null);
    return true;
  }, [params.selectedEntity, params.canSave, params.invoiceNumber]);

  const submit = useCallback(
    (
      save: (input: ReturnType<typeof buildInvoiceInput>) => Promise<unknown>,
      setIsSubmitting: (value: boolean) => void,
      messages: SubmitMessages,
    ) => {
      if (!validateBeforeSave() || !params.selectedEntity) return;
      const input = buildInvoiceInput({
        entityId: params.entityId,
        supplierId: params.supplierId,
        invoiceNumber: params.invoiceNumber,
        invoiceDate: params.invoiceDate,
        vatMode: params.vatMode,
        vatRate: params.selectedEntity.defaultVatRate,
        validLines: params.validLines,
        itemMetaMap: params.itemMetaMap,
      });
      void runInvoiceSubmit(input, save, messages, {
        setIsSubmitting,
        setSaveError,
        onSaved: params.onSaved,
      });
    },
    [validateBeforeSave, params],
  );

  const handleSave = useCallback(
    () => submit(invoiceService.saveAndPostInvoice, setIsSaving, SAVE_MESSAGES),
    [submit],
  );
  const handleSaveDraft = useCallback(
    () => submit(invoiceService.saveInvoice, setIsSavingDraft, DRAFT_MESSAGES),
    [submit],
  );

  return { isSaving, isSavingDraft, saveError, handleSave, handleSaveDraft, validateBeforeSave };
}

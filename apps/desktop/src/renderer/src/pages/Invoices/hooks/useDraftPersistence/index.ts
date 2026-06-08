import { useCallback, useEffect } from 'react';
import type { ProcessReceiptLine, VatMode } from '../../types';

export type DraftState = {
  lines: ProcessReceiptLine[];
  invoiceNumber: string;
  invoiceDate: string;
  vatMode: VatMode;
};

const DRAFT_KEY = 'reyogo:invoice-draft';

export function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

export function saveDraft(state: DraftState): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function useDraftPersistence(
  lines: ProcessReceiptLine[],
  invoiceNumber: string,
  invoiceDate: string,
  vatMode: VatMode,
  isReused: boolean,
): { clearDraft: () => void } {
  const save = useCallback(() => {
    if (isReused) return;
    const hasMeaningfulContent =
      lines.some((l) => l.itemId) || !!invoiceNumber.trim() || !!invoiceDate;
    if (hasMeaningfulContent) {
      saveDraft({ lines, invoiceNumber, invoiceDate, vatMode });
    } else {
      clearDraft();
    }
  }, [lines, invoiceNumber, invoiceDate, vatMode, isReused]);

  useEffect(() => {
    save();
  }, [save]);

  return { clearDraft };
}

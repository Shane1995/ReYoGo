import { useCallback, useEffect } from 'react';
import type { ProcessReceiptLine, VatMode } from '../../types';
import { DRAFT_KEY } from './constants';
import type { DraftState } from './types';

export type { DraftState } from './types';

function isDraftState(value: unknown): value is DraftState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'lines' in value &&
    'invoiceNumber' in value &&
    'invoiceDate' in value &&
    'vatMode' in value
  );
}

export function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isDraftState(parsed) ? parsed : null;
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

function hasMeaningfulContent(
  lines: ProcessReceiptLine[],
  invoiceNumber: string,
  invoiceDate: string,
): boolean {
  if (lines.some((l) => l.itemId)) return true;
  if (invoiceNumber.trim()) return true;
  return !!invoiceDate;
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
    if (hasMeaningfulContent(lines, invoiceNumber, invoiceDate)) {
      saveDraft({ lines, invoiceNumber, invoiceDate, vatMode });
      return;
    }
    clearDraft();
  }, [lines, invoiceNumber, invoiceDate, vatMode, isReused]);

  useEffect(() => {
    save();
  }, [save]);

  return { clearDraft };
}

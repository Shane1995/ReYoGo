import type { IScannedInvoice } from '@reyogo/types';

function missingFieldNotes(invoice: IScannedInvoice): string[] {
  const notes: string[] = [];
  if (!invoice.supplierName) notes.push('Supplier name wasn’t detected');
  if (!invoice.invoiceDate) notes.push('Invoice date wasn’t detected');
  if (!invoice.invoiceNumber) notes.push('Invoice number wasn’t detected');
  return notes;
}

function unmatchedLinesNote(unmatchedLineCount: number): string | null {
  if (unmatchedLineCount === 0) return null;
  if (unmatchedLineCount === 1) return '1 line item couldn’t be matched to inventory';
  return `${unmatchedLineCount} line items couldn’t be matched to inventory`;
}

function overallConfidenceNote(invoice: IScannedInvoice): string | null {
  if (invoice.confidence === 'high') return null;
  return 'AI wasn’t fully confident reading this document — please double-check the details';
}

export function scannedInvoiceReviewNotes(
  invoice: IScannedInvoice,
  unmatchedLineCount: number,
): string[] {
  return [
    ...missingFieldNotes(invoice),
    unmatchedLinesNote(unmatchedLineCount),
    overallConfidenceNote(invoice),
  ].filter((note): note is string => note !== null);
}

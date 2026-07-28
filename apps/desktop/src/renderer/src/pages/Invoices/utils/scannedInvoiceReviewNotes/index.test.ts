import { describe, it, expect } from 'vitest';
import { scannedInvoiceReviewNotes } from './index';
import { VatMode, type IScannedInvoice } from '@reyogo/types';

const complete: IScannedInvoice = {
  supplierName: 'Acme Foods',
  supplierNameConfidence: 'high',
  invoiceDate: '2026-07-01',
  invoiceDateConfidence: 'high',
  invoiceNumber: 'INV-1',
  invoiceNumberConfidence: 'high',
  vatMode: VatMode.Exclusive,
  invoiceTotal: 100,
  lines: [],
  confidence: 'high',
};

describe('scannedInvoiceReviewNotes', () => {
  it('returns no notes when everything was detected with high confidence and no unmatched lines', () => {
    expect(scannedInvoiceReviewNotes(complete, 0)).toEqual([]);
  });

  it('flags missing supplier, date, and invoice number', () => {
    const notes = scannedInvoiceReviewNotes(
      { ...complete, supplierName: null, invoiceDate: null, invoiceNumber: null },
      0,
    );
    expect(notes).toEqual([
      'Supplier name wasn’t detected',
      'Invoice date wasn’t detected',
      'Invoice number wasn’t detected',
    ]);
  });

  it('flags unmatched line items with correct pluralisation', () => {
    expect(scannedInvoiceReviewNotes(complete, 1)).toEqual([
      '1 line item couldn’t be matched to inventory',
    ]);
    expect(scannedInvoiceReviewNotes(complete, 3)).toEqual([
      '3 line items couldn’t be matched to inventory',
    ]);
  });

  it('flags low/medium overall confidence', () => {
    expect(scannedInvoiceReviewNotes({ ...complete, confidence: 'low' }, 0)).toEqual([
      'AI wasn’t fully confident reading this document — please double-check the details',
    ]);
  });
});

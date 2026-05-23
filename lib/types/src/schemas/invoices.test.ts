import { describe, expect, it } from 'vitest';
import {
  CapturedInvoiceSchema,
  InvoiceLineInputSchema,
  SaveCapturedInvoicePayloadSchema,
  UpdateCapturedInvoicePayloadSchema,
  VatModeSchema,
} from './invoices';

const LINE_ID = '550e8400-e29b-41d4-a716-446655440010';
const INVOICE_ID = '550e8400-e29b-41d4-a716-446655440020';
const ITEM_ID = '550e8400-e29b-41d4-a716-446655440030';

describe('VatModeSchema', () => {
  it('accepts valid vat modes', () => {
    expect(VatModeSchema.parse('inclusive')).toBe('inclusive');
    expect(VatModeSchema.parse('exclusive')).toBe('exclusive');
    expect(VatModeSchema.parse('non-taxable')).toBe('non-taxable');
  });

  it('rejects an unknown vat mode', () => {
    expect(() => VatModeSchema.parse('exempt')).toThrow();
  });
});

describe('InvoiceLineInputSchema', () => {
  it('accepts a valid invoice line', () => {
    const result = InvoiceLineInputSchema.parse({
      id: LINE_ID,
      itemId: ITEM_ID,
      itemNameSnapshot: 'Full Cream Milk',
      quantity: 10,
      vatMode: 'inclusive',
      vatRate: 0.15,
      totalVatExclude: 86.96,
    });
    expect(result.quantity).toBe(10);
  });

  it('rejects a zero quantity', () => {
    expect(() =>
      InvoiceLineInputSchema.parse({
        id: LINE_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        quantity: 0,
        vatMode: 'inclusive',
        vatRate: 0.15,
        totalVatExclude: 0,
      }),
    ).toThrow();
  });

  it('rejects a vatRate above 1', () => {
    expect(() =>
      InvoiceLineInputSchema.parse({
        id: LINE_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        quantity: 1,
        vatMode: 'inclusive',
        vatRate: 15,
        totalVatExclude: 1,
      }),
    ).toThrow();
  });

  it('rejects a negative totalVatExclude', () => {
    expect(() =>
      InvoiceLineInputSchema.parse({
        id: LINE_ID,
        itemId: ITEM_ID,
        itemNameSnapshot: 'Full Cream Milk',
        quantity: 1,
        vatMode: 'inclusive',
        vatRate: 0.15,
        totalVatExclude: -1,
      }),
    ).toThrow();
  });
});

describe('CapturedInvoiceSchema', () => {
  it('accepts a valid invoice with optional nulls', () => {
    const result = CapturedInvoiceSchema.parse({
      id: INVOICE_ID,
      invoiceNumber: null,
      invoiceDate: null,
      createdAt: '2026-05-08T10:00:00.000Z',
      updatedAt: null,
    });
    expect(result.id).toBe(INVOICE_ID);
  });

  it('rejects a non-ISO createdAt', () => {
    expect(() =>
      CapturedInvoiceSchema.parse({ id: INVOICE_ID, createdAt: '8 May 2026' }),
    ).toThrow();
  });
});

describe('SaveCapturedInvoicePayloadSchema', () => {
  it('accepts a valid save payload with lines', () => {
    const result = SaveCapturedInvoicePayloadSchema.parse({
      id: INVOICE_ID,
      lines: [
        {
          id: LINE_ID,
          itemId: ITEM_ID,
          itemNameSnapshot: 'Milk',
          quantity: 2,
          vatMode: 'exclusive',
          vatRate: 0.15,
          totalVatExclude: 20,
        },
      ],
    });
    expect(result.lines).toHaveLength(1);
  });

  it('accepts an empty lines array', () => {
    const result = SaveCapturedInvoicePayloadSchema.parse({ id: INVOICE_ID, lines: [] });
    expect(result.lines).toHaveLength(0);
  });
});

describe('UpdateCapturedInvoicePayloadSchema', () => {
  it('accepts a valid update payload with optional note', () => {
    const result = UpdateCapturedInvoicePayloadSchema.parse({
      id: INVOICE_ID,
      note: 'Corrected quantity',
      lines: [],
    });
    expect(result.note).toBe('Corrected quantity');
  });
});

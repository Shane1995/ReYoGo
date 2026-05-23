import { z } from 'zod';

export const VatModeSchema = z.enum(['inclusive', 'exclusive', 'non-taxable']);

export const InvoiceLineInputSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  itemNameSnapshot: z.string().min(1),
  unitOfMeasure: z.string().nullable().optional(),
  quantity: z.number().positive(),
  vatMode: VatModeSchema,
  vatRate: z.number().min(0).max(1),
  totalVatExclude: z.number().min(0),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().nullable(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable().optional(),
});

export const InvoiceLineSchema = InvoiceLineInputSchema;

export const InvoiceWithLinesSchema = InvoiceSchema.extend({
  lines: z.array(InvoiceLineSchema),
});

export const SaveInvoicePayloadSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().datetime().nullable().optional(),
  lines: z.array(InvoiceLineInputSchema),
});

export const UpdateInvoicePayloadSchema = z.object({
  id: z.string().uuid(),
  note: z.string().optional(),
  lines: z.array(InvoiceLineInputSchema),
});

export type VatMode = z.infer<typeof VatModeSchema>;
export type InvoiceLineInput = z.infer<typeof InvoiceLineInputSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceLine = z.infer<typeof InvoiceLineSchema>;
export type InvoiceWithLines = z.infer<typeof InvoiceWithLinesSchema>;
export type SaveInvoicePayload = z.infer<typeof SaveInvoicePayloadSchema>;
export type UpdateInvoicePayload = z.infer<typeof UpdateInvoicePayloadSchema>;

// Backward-compat re-exports — remove once renderer is fully updated
export const CapturedInvoiceSchema = InvoiceSchema;
export const CapturedInvoiceLineSchema = InvoiceLineSchema;
export const CapturedInvoiceWithLinesSchema = InvoiceWithLinesSchema;
export const SaveCapturedInvoicePayloadSchema = SaveInvoicePayloadSchema;
export const UpdateCapturedInvoicePayloadSchema = UpdateInvoicePayloadSchema;

export type CapturedInvoice = Invoice;
export type CapturedInvoiceLine = InvoiceLine;
export type CapturedInvoiceWithLines = InvoiceWithLines;
export type SaveCapturedInvoicePayload = SaveInvoicePayload;
export type UpdateCapturedInvoicePayload = UpdateInvoicePayload;

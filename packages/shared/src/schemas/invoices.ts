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

export const CapturedInvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable().optional(),
});

export const SaveCapturedInvoicePayloadSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().datetime().nullable().optional(),
  lines: z.array(InvoiceLineInputSchema),
});

export const UpdateCapturedInvoicePayloadSchema = z.object({
  id: z.string().uuid(),
  note: z.string().optional(),
  lines: z.array(InvoiceLineInputSchema),
});

export type VatMode = z.infer<typeof VatModeSchema>;
export type InvoiceLineInput = z.infer<typeof InvoiceLineInputSchema>;
export type CapturedInvoice = z.infer<typeof CapturedInvoiceSchema>;
export type SaveCapturedInvoicePayload = z.infer<typeof SaveCapturedInvoicePayloadSchema>;
export type UpdateCapturedInvoicePayload = z.infer<typeof UpdateCapturedInvoicePayloadSchema>;

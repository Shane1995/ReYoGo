import { z } from 'zod';

export const StockMovementTypeSchema = z.enum(['IN', 'OUT', 'ADJUSTMENT', 'WASTE', 'RETURN']);
export const ReferenceTypeSchema = z.enum(['invoice', 'manual', 'adjustment']);

export const StockMovementSchema = z.object({
  id: z.string(),
  inventoryItemId: z.string(),
  movementType: StockMovementTypeSchema,
  qty: z.number(),
  unitCostAtTime: z.number().nullable(),
  totalCost: z.number().nullable(),
  weightedAvgCostAfter: z.number().nullable(),
  stockQtyAfter: z.number(),
  referenceType: ReferenceTypeSchema.nullable(),
  referenceId: z.string().nullable(),
  notes: z.string().nullable(),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;
export type ReferenceType = z.infer<typeof ReferenceTypeSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;

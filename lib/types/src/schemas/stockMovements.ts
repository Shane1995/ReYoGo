import { z } from 'zod';

export const StockMovementTypeSchema = z.enum(['IN', 'OUT', 'ADJUSTMENT']);
export const StockMovementSourceSchema = z.enum(['invoice', 'usage', 'adjustment']);

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  itemNameSnapshot: z.string().min(1),
  type: StockMovementTypeSchema,
  quantity: z.number().refine((n) => n !== 0, { message: 'quantity must be non-zero' }),
  source: StockMovementSourceSchema,
  referenceId: z.string().uuid().nullable().optional(),
  costAtTime: z.number().min(0).nullable().optional(),
  cogsAmount: z.number().min(0).nullable().optional(),
  createdAt: z.string().datetime(),
});

export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;
export type StockMovementSource = z.infer<typeof StockMovementSourceSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;

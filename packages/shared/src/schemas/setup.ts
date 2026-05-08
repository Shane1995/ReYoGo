import { z } from 'zod';

export const UnitOfMeasureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
});

export const CreateUnitOfMeasureSchema = UnitOfMeasureSchema.omit({ id: true });

export type UnitOfMeasure = z.infer<typeof UnitOfMeasureSchema>;
export type CreateUnitOfMeasure = z.infer<typeof CreateUnitOfMeasureSchema>;

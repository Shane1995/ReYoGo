import { z } from 'zod';

export const InventoryCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.string().min(1),
});

export const CreateInventoryCategorySchema = InventoryCategorySchema.omit({ id: true });

export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  type: z.string().min(1),
  unitOfMeasure: z.string().optional(),
});

export const CreateInventoryItemSchema = InventoryItemSchema.omit({ id: true });

export const InventorySubmitPayloadSchema = z.object({
  addedCategories: z.array(CreateInventoryCategorySchema),
  addedItems: z.array(CreateInventoryItemSchema),
  updatedCategories: z.array(InventoryCategorySchema),
  updatedItems: z.array(InventoryItemSchema),
  deletedCategoryIds: z.array(z.string().uuid()),
  deletedItemIds: z.array(z.string().uuid()),
});

export type InventoryCategory = z.infer<typeof InventoryCategorySchema>;
export type CreateInventoryCategory = z.infer<typeof CreateInventoryCategorySchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;
export type InventorySubmitPayload = z.infer<typeof InventorySubmitPayloadSchema>;

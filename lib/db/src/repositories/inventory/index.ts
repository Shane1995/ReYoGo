import { asc, desc, eq } from 'drizzle-orm';
import type {
  Category,
  InventoryItem,
  InventoryItemInput,
  InventorySubmitPayload,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { now } from '../../utils/timestamps';

export function createInventoryRepo(db: DbClient) {
  return {
    async getCategories(): Promise<Category[]> {
      const rows = await db
        .select()
        .from(schema.inventoryCategories)
        .orderBy(schema.inventoryCategories.name);
      return rows.map((r) => ({ id: r.id, name: r.name, type: r.type as Category['type'] }));
    },

    async getItems(): Promise<InventoryItem[]> {
      const itemRows = await db
        .select()
        .from(schema.inventoryItems)
        .orderBy(asc(schema.inventoryItems.name));
      const movementRows = await db
        .select({
          inventoryItemId: schema.stockMovements.inventoryItemId,
          stockQtyAfter: schema.stockMovements.stockQtyAfter,
          weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
        })
        .from(schema.stockMovements)
        .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt));
      const latestMovement = new Map<
        string,
        { stockQtyAfter: number; weightedAvgCostAfter: number | null }
      >();
      for (const m of movementRows) {
        if (!latestMovement.has(m.inventoryItemId)) {
          latestMovement.set(m.inventoryItemId, {
            stockQtyAfter: m.stockQtyAfter,
            weightedAvgCostAfter: m.weightedAvgCostAfter,
          });
        }
      }
      return itemRows.map((row) => {
        const movement = latestMovement.get(row.id);
        return {
          id: row.id,
          name: row.name,
          categoryId: row.categoryId,
          unitOfMeasureId: row.unitOfMeasureId ?? null,
          sku: row.sku ?? null,
          currentStockQty: movement?.stockQtyAfter ?? 0,
          currentWeightedAvgCost: movement?.weightedAvgCostAfter ?? null,
          reorderPoint: row.reorderPoint ?? null,
          reorderQty: row.reorderQty ?? null,
        };
      });
    },

    async upsertCategory(category: Category): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryCategories)
        .values({
          id: category.id,
          accountId: 'default',
          name: category.name,
          type: category.type,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryCategories.id,
          set: { name: category.name, type: category.type, updatedAt: ts },
        });
    },

    async upsertItem(item: InventoryItemInput): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryItems)
        .values({
          id: item.id,
          accountId: 'default',
          name: item.name,
          categoryId: item.categoryId,
          unitOfMeasureId: item.unitOfMeasureId ?? null,
          sku: item.sku ?? null,
          reorderPoint: item.reorderPoint ?? null,
          reorderQty: item.reorderQty ?? null,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryItems.id,
          set: {
            name: item.name,
            categoryId: item.categoryId,
            unitOfMeasureId: item.unitOfMeasureId ?? null,
            sku: item.sku ?? null,
            reorderPoint: item.reorderPoint ?? null,
            reorderQty: item.reorderQty ?? null,
            updatedAt: ts,
          },
        });
    },

    async submitInventory(payload: InventorySubmitPayload): Promise<void> {
      for (const cat of payload.addedCategories) await this.upsertCategory(cat);
      for (const cat of payload.updatedCategories) await this.upsertCategory(cat);
      for (const item of payload.addedItems) await this.upsertItem(item);
      for (const item of payload.updatedItems) await this.upsertItem(item);
      for (const id of payload.deletedCategoryIds)
        await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
      for (const id of payload.deletedItemIds)
        await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },

    async deleteCategory(id: string): Promise<void> {
      await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
    },

    async deleteItem(id: string): Promise<void> {
      await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },
  };
}

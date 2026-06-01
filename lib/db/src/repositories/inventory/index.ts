import { and, asc, count, desc, eq, isNotNull, isNull } from 'drizzle-orm';
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
        .where(isNull(schema.inventoryCategories.archivedAt))
        .orderBy(schema.inventoryCategories.name);
      return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
    },

    async getItems(entityId?: string): Promise<InventoryItem[]> {
      const itemRows = await db
        .select()
        .from(schema.inventoryItems)
        .where(isNull(schema.inventoryItems.archivedAt))
        .orderBy(asc(schema.inventoryItems.name));

      const movementRows = await db
        .select({
          inventoryItemId: schema.stockMovements.inventoryItemId,
          entityId: schema.stockMovements.entityId,
          stockQtyAfter: schema.stockMovements.stockQtyAfter,
          weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
        })
        .from(schema.stockMovements)
        .where(entityId ? eq(schema.stockMovements.entityId, entityId) : undefined)
        .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt));

      type StockEntry = { stockQtyAfter: number; weightedAvgCostAfter: number | null };
      let stockMap: Map<string, StockEntry>;

      if (entityId) {
        stockMap = new Map();
        for (const m of movementRows) {
          if (!stockMap.has(m.inventoryItemId)) {
            stockMap.set(m.inventoryItemId, {
              stockQtyAfter: m.stockQtyAfter,
              weightedAvgCostAfter: m.weightedAvgCostAfter ?? null,
            });
          }
        }
      } else {
        const perEntityItem = new Map<string, { qty: number; wac: number | null }>();
        for (const m of movementRows) {
          const key = `${m.inventoryItemId}::${m.entityId}`;
          if (!perEntityItem.has(key)) {
            perEntityItem.set(key, {
              qty: m.stockQtyAfter,
              wac: m.weightedAvgCostAfter ?? null,
            });
          }
        }
        type Accum = { totalQty: number; weightedCostSum: number; hasNullWac: boolean };
        const aggMap = new Map<string, Accum>();
        for (const [key, val] of perEntityItem) {
          const itemId = key.split('::')[0]!;
          const existing = aggMap.get(itemId);
          if (!existing) {
            aggMap.set(itemId, {
              totalQty: val.qty,
              weightedCostSum: val.wac !== null ? val.qty * val.wac : 0,
              hasNullWac: val.wac === null,
            });
          } else {
            existing.totalQty += val.qty;
            if (val.wac !== null) existing.weightedCostSum += val.qty * val.wac;
            else existing.hasNullWac = true;
          }
        }
        stockMap = new Map();
        for (const [itemId, agg] of aggMap) {
          stockMap.set(itemId, {
            stockQtyAfter: agg.totalQty,
            weightedAvgCostAfter:
              !agg.hasNullWac && agg.totalQty > 0 ? agg.weightedCostSum / agg.totalQty : null,
          });
        }
      }

      return itemRows.map((row) => {
        const stock = stockMap.get(row.id);
        return {
          id: row.id,
          name: row.name,
          categoryId: row.categoryId,
          unitOfMeasureId: row.unitOfMeasureId ?? null,
          sku: row.sku ?? null,
          currentStockQty: stock?.stockQtyAfter ?? 0,
          currentWeightedAvgCost: stock?.weightedAvgCostAfter ?? null,
          reorderPoint: row.reorderPoint ?? null,
          reorderQty: row.reorderQty ?? null,
        };
      });
    },

    async upsertCategory(category: Category, accountId: string): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryCategories)
        .values({
          id: category.id,
          accountId,
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

    async upsertItem(item: InventoryItemInput, groupId: string): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryItems)
        .values({
          id: item.id,
          groupId,
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

    async submitInventory(
      payload: InventorySubmitPayload,
      accountId: string,
      groupId: string,
    ): Promise<void> {
      for (const cat of payload.addedCategories) await this.upsertCategory(cat, accountId);
      for (const cat of payload.updatedCategories) await this.upsertCategory(cat, accountId);
      for (const item of payload.addedItems) await this.upsertItem(item, groupId);
      for (const item of payload.updatedItems) await this.upsertItem(item, groupId);
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

    async getArchivedItems(): Promise<InventoryItem[]> {
      const rows = await db
        .select()
        .from(schema.inventoryItems)
        .where(isNotNull(schema.inventoryItems.archivedAt))
        .orderBy(asc(schema.inventoryItems.name));
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        categoryId: row.categoryId,
        unitOfMeasureId: row.unitOfMeasureId ?? null,
        sku: row.sku ?? null,
        currentStockQty: 0,
        currentWeightedAvgCost: null,
        reorderPoint: row.reorderPoint ?? null,
        reorderQty: row.reorderQty ?? null,
      }));
    },

    async getItemUsageCount(id: string): Promise<number> {
      const [lines] = await db
        .select({ n: count() })
        .from(schema.invoiceLineItems)
        .where(eq(schema.invoiceLineItems.inventoryItemId, id));
      const [movements] = await db
        .select({ n: count() })
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.inventoryItemId, id));
      return (lines?.n ?? 0) + (movements?.n ?? 0);
    },

    async archiveItem(id: string): Promise<void> {
      await db
        .update(schema.inventoryItems)
        .set({ archivedAt: now() })
        .where(eq(schema.inventoryItems.id, id));
    },

    async restoreItem(id: string): Promise<void> {
      await db
        .update(schema.inventoryItems)
        .set({ archivedAt: null })
        .where(eq(schema.inventoryItems.id, id));
    },

    async hardDeleteItem(id: string): Promise<void> {
      const usage = await this.getItemUsageCount(id);
      if (usage > 0) throw new Error(`Item has ${usage} usages and cannot be deleted.`);
      await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },

    async getArchivedCategories(): Promise<Category[]> {
      const rows = await db
        .select()
        .from(schema.inventoryCategories)
        .where(isNotNull(schema.inventoryCategories.archivedAt))
        .orderBy(schema.inventoryCategories.name);
      return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
    },

    async getCategoryUsageCount(id: string): Promise<number> {
      const [row] = await db
        .select({ n: count() })
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.categoryId, id));
      return row?.n ?? 0;
    },

    async archiveCategory(id: string): Promise<void> {
      const ts = now();
      await db
        .update(schema.inventoryCategories)
        .set({ archivedAt: ts })
        .where(eq(schema.inventoryCategories.id, id));
      await db
        .update(schema.inventoryItems)
        .set({ archivedAt: ts })
        .where(
          and(eq(schema.inventoryItems.categoryId, id), isNull(schema.inventoryItems.archivedAt)),
        );
    },

    async restoreCategory(id: string): Promise<void> {
      await db
        .update(schema.inventoryCategories)
        .set({ archivedAt: null })
        .where(eq(schema.inventoryCategories.id, id));
      await db
        .update(schema.inventoryItems)
        .set({ archivedAt: null })
        .where(eq(schema.inventoryItems.categoryId, id));
    },

    async hardDeleteCategory(id: string): Promise<void> {
      const usage = await this.getCategoryUsageCount(id);
      if (usage > 0) throw new Error(`Category has ${usage} assigned items and cannot be deleted.`);
      await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
    },
  };
}

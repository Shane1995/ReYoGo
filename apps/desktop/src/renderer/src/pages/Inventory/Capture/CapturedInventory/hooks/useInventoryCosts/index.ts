import { useState, useCallback, useEffect } from 'react';
import { invoiceService } from '@/services/invoice';
import { stockMovementsService } from '@/services/stockMovements';
import type { InvoiceLineWithDate } from '@reyogo/types';

export type ItemCostEntry = {
  lastUnitCost: number | null;
  lastCostDate: Date | null;
  weightedAvgCost: number | null;
  lastUnitCostInclVat: number | null;
};

type WacRecord = Record<string, number | null>;

function isNewerCostEntry(existing: ItemCostEntry | undefined, date: Date): boolean {
  if (!existing) return true;
  const existingDate = existing.lastCostDate ?? new Date(0);
  return date > existingDate;
}

function lastUnitCostInclVatOf(line: InvoiceLineWithDate): number {
  if (line.unitCostInclVat != null) return line.unitCostInclVat;
  if (line.isVatable) return line.unitCost * (1 + line.vatRate / 100);
  return line.unitCost;
}

function applyLineToCostMap(
  map: Map<string, ItemCostEntry>,
  line: InvoiceLineWithDate,
  wacRecord: WacRecord,
): void {
  if (line.qty <= 0) return;
  const date = new Date(line.invoiceDate);
  const existing = map.get(line.inventoryItemId);
  if (!isNewerCostEntry(existing, date)) return;
  map.set(line.inventoryItemId, {
    lastUnitCost: line.unitCost,
    lastCostDate: date,
    weightedAvgCost: wacRecord[line.inventoryItemId] ?? null,
    lastUnitCostInclVat: lastUnitCostInclVatOf(line),
  });
}

function addMissingWacEntries(map: Map<string, ItemCostEntry>, wacRecord: WacRecord): void {
  for (const [itemId, wac] of Object.entries(wacRecord)) {
    if (map.has(itemId)) continue;
    map.set(itemId, {
      lastUnitCost: null,
      lastCostDate: null,
      weightedAvgCost: wac,
      lastUnitCostInclVat: null,
    });
  }
}

export function useInventoryCosts(): Map<string, ItemCostEntry> {
  const [costMap, setCostMap] = useState<Map<string, ItemCostEntry>>(new Map());

  const loadCosts = useCallback(async () => {
    const [lines, wacRecord] = await Promise.all([
      invoiceService.getLinesForAnalysis(),
      stockMovementsService.getWeightedAvgCosts(),
    ]);
    const map = new Map<string, ItemCostEntry>();
    for (const line of lines) {
      applyLineToCostMap(map, line, wacRecord);
    }
    addMissingWacEntries(map, wacRecord);
    setCostMap(map);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadCosts()
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
      });
    return () => {
      cancelled = true;
    };
  }, [loadCosts]);

  return costMap;
}

import { useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import { useCancellableFetch } from '../../../../hooks/useCancellableFetch';
import { itemTotalRowsOf } from '../../../../utils/itemTotalRowsOf';
import type { ItemTotalRow } from '../../../../utils/itemTotalRowsOf/types';

export function useCreditReportData(
  fromDate: string,
  toDate: string,
  entityId: string | undefined,
) {
  const { items, categories } = useInventory();
  const [rows, setRows] = useState<ItemTotalRow[]>([]);

  const loading = useCancellableFetch(
    () =>
      invoiceService.getCreditTotalsByItem(fromDate || undefined, toDate || undefined, entityId),
    (totals) => setRows(itemTotalRowsOf(items, categories, totals)),
    () => setRows([]),
    [items, categories, fromDate, toDate, entityId],
  );

  return { loading, rows };
}

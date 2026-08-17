import { useEffect, useState } from 'react';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { invoiceService } from '@/services/invoice';
import { itemTotalRowsOf } from '../../../../utils/itemTotalRowsOf';
import type { ItemTotalRow } from '../../../../utils/itemTotalRowsOf/types';

export function useCreditReportData(
  fromDate: string,
  toDate: string,
  entityId: string | undefined,
) {
  const { items, categories } = useInventory();
  const [rows, setRows] = useState<ItemTotalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    invoiceService
      .getCreditTotalsByItem(fromDate || undefined, toDate || undefined, entityId)
      .then((totals) => {
        if (!cancelled) setRows(itemTotalRowsOf(items, categories, totals));
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [items, categories, fromDate, toDate, entityId]);

  return { loading, rows };
}

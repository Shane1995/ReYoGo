import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InventoryIPC, SetupIPC } from '@shared/types/ipc';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import type { ArchivedItem } from '../../types';

export function useArchivedItems() {
  const [itemRows, setItemRows] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const ipcInvoke = window.electronAPI.ipcRenderer.invoke;
      const [archivedItems, categories, units] = await Promise.all([
        ipcInvoke(InventoryIPC.GET_ARCHIVED_ITEMS),
        ipcInvoke(InventoryIPC.GET_CATEGORIES),
        ipcInvoke(SetupIPC.GET_UNITS),
      ]);
      const catMap = new Map(categories.map((c) => [c.id, c.name]));
      const unitMap = new Map(units.map((u) => [u.id, u.name]));
      setItemRows(
        archivedItems.map((item) => ({
          id: item.id,
          name: item.name,
          categoryName: catMap.get(item.categoryId) ?? '—',
          unitOfMeasure: item.unitOfMeasureId ? unitMap.get(item.unitOfMeasureId) : undefined,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const unarchiveItem = useCallback(
    async (id: string) => {
      try {
        await window.electronAPI.ipcRenderer.invoke(InventoryIPC.RESTORE_ITEM, id);
        toast.success('Item restored');
        await loadItems();
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to restore the item'));
      }
    },
    [loadItems],
  );

  return { itemRows, loading, unarchiveItem };
}

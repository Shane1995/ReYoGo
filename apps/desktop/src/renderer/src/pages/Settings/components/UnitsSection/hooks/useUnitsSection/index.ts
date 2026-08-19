import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { UnitOfMeasure } from '@reyogo/types';
import { setupService } from '@/services/setup';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { checkUnitName } from './utils/checkUnitName';
import type { UnitWithUsage } from '../../types';

async function withUsageCounts(units: UnitOfMeasure[]): Promise<UnitWithUsage[]> {
  const counts = await Promise.all(units.map((u) => setupService.getUnitUsageCount(u.id)));
  return units.map((u, i) => ({ ...u, usageCount: counts[i] ?? 0 }));
}

export function useUnitsSection() {
  const [units, setUnits] = useState<UnitWithUsage[]>([]);
  const [archivedUnits, setArchivedUnits] = useState<UnitWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [addName, setAddName] = useState('');

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await setupService.getUnits();
      setUnits(await withUsageCounts(rows));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArchivedUnits = useCallback(async () => {
    const rows = await setupService.getArchivedUnits();
    setArchivedUnits(await withUsageCounts(rows));
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const toggleShowArchived = useCallback(async () => {
    const next = !showArchived;
    setShowArchived(next);
    if (next) await loadArchivedUnits();
  }, [showArchived, loadArchivedUnits]);

  const allUnits = useCallback(() => [...units, ...archivedUnits], [units, archivedUnits]);

  const handleAdd = useCallback(async () => {
    const check = checkUnitName(allUnits(), addName);
    if (!check.ok) return;
    try {
      await setupService.upsertUnit({ id: crypto.randomUUID(), name: check.name });
      setAddName('');
      toast.success('Unit added');
      await loadUnits();
    } catch (err) {
      toast.error(ipcErrorMessage(err, 'Failed to add the unit'));
    }
  }, [addName, allUnits, loadUnits]);

  const handleRename = useCallback(
    async (id: string, name: string) => {
      const check = checkUnitName(allUnits(), name, id);
      if (!check.ok) return;
      try {
        await setupService.upsertUnit({ id, name: check.name });
        toast.success('Unit renamed');
        await loadUnits();
        if (showArchived) await loadArchivedUnits();
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to rename the unit'));
      }
    },
    [allUnits, loadUnits, loadArchivedUnits, showArchived],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      try {
        await setupService.archiveUnit(id);
        toast.success('Unit archived');
        await loadUnits();
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to archive the unit'));
      }
    },
    [loadUnits],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      try {
        await setupService.restoreUnit(id);
        toast.success('Unit restored');
        await loadUnits();
        await loadArchivedUnits();
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to restore the unit'));
      }
    },
    [loadUnits, loadArchivedUnits],
  );

  const handleHardDelete = useCallback(
    async (id: string) => {
      const unit = archivedUnits.find((u) => u.id === id);
      if (unit && unit.usageCount > 0) {
        toast.error('This unit is still used by items and cannot be deleted');
        return;
      }
      try {
        await setupService.hardDeleteUnit(id);
        toast.success('Unit deleted');
        await loadArchivedUnits();
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to delete the unit'));
      }
    },
    [archivedUnits, loadArchivedUnits],
  );

  return {
    units,
    archivedUnits,
    loading,
    showArchived,
    toggleShowArchived,
    addName,
    setAddName,
    handleAdd,
    handleRename,
    handleArchive,
    handleRestore,
    handleHardDelete,
  };
}

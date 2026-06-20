import { ipcMain } from 'electron';
import type { UnitOfMeasure } from '@reyogo/types';
import { SetupIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';
import { scheduleDebouncedSync } from '../../db/syncScheduler';

export function registerSetupHandlers(): void {
  ipcMain.handle(SetupIPC.GET_UNITS, () => getRepos().setup.getUnits());
  ipcMain.handle(SetupIPC.UPSERT_UNIT, async (_e, unit: UnitOfMeasure) => {
    const result = await getRepos().setup.upsertUnit(unit);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(SetupIPC.DELETE_UNIT, async (_e, id: string) => {
    const result = await getRepos().setup.deleteUnit(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(SetupIPC.ARCHIVE_UNIT, async (_e, id: string) => {
    const result = await getRepos().setup.archiveUnit(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(SetupIPC.RESTORE_UNIT, async (_e, id: string) => {
    const result = await getRepos().setup.restoreUnit(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(SetupIPC.HARD_DELETE_UNIT, async (_e, id: string) => {
    const result = await getRepos().setup.hardDeleteUnit(id);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(SetupIPC.GET_UNIT_USAGE_COUNT, (_e, id: string) =>
    getRepos().setup.getUnitUsageCount(id),
  );
  ipcMain.handle(SetupIPC.GET_ARCHIVED_UNITS, () => getRepos().setup.getArchivedUnits());
}

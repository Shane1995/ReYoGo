import { ipcMain } from 'electron';
import type { UnitOfMeasure } from '@reyogo/types';
import { SetupIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';
import { withSync } from '../../db/syncScheduler';

export function registerSetupHandlers(): void {
  ipcMain.handle(SetupIPC.GET_UNITS, () => getRepos().setup.getUnits());
  ipcMain.handle(SetupIPC.UPSERT_UNIT, (_e, unit: UnitOfMeasure) =>
    withSync(() => getRepos().setup.upsertUnit(unit)),
  );
  ipcMain.handle(SetupIPC.DELETE_UNIT, (_e, id: string) =>
    withSync(() => getRepos().setup.deleteUnit(id)),
  );
  ipcMain.handle(SetupIPC.ARCHIVE_UNIT, (_e, id: string) =>
    withSync(() => getRepos().setup.archiveUnit(id)),
  );
  ipcMain.handle(SetupIPC.RESTORE_UNIT, (_e, id: string) =>
    withSync(() => getRepos().setup.restoreUnit(id)),
  );
  ipcMain.handle(SetupIPC.HARD_DELETE_UNIT, (_e, id: string) =>
    withSync(() => getRepos().setup.hardDeleteUnit(id)),
  );
  ipcMain.handle(SetupIPC.GET_UNIT_USAGE_COUNT, (_e, id: string) =>
    getRepos().setup.getUnitUsageCount(id),
  );
  ipcMain.handle(SetupIPC.GET_ARCHIVED_UNITS, () => getRepos().setup.getArchivedUnits());
}

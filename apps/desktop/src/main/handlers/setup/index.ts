import { ipcMain } from 'electron';
import type { UnitOfMeasure } from '@reyogo/types';
import { SetupIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerSetupHandlers(): void {
  ipcMain.handle(SetupIPC.GET_UNITS, () => getRepos().setup.getUnits());
  ipcMain.handle(SetupIPC.UPSERT_UNIT, (_e, unit: UnitOfMeasure) =>
    getRepos().setup.upsertUnit(unit),
  );
  ipcMain.handle(SetupIPC.DELETE_UNIT, (_e, id: string) => getRepos().setup.deleteUnit(id));
}

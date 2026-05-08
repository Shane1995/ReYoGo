import { ipcMain } from 'electron';
import type { IUnitOfMeasure } from '@shared/types/contract';
import { SetupIPC } from '../../../shared/types/ipc';
import * as setupDb from '../../dataAccess/setup';

export function registerSetupHandlers(): void {
  ipcMain.handle(SetupIPC.GET_STATUS, () => setupDb.getSetupStatus());
  ipcMain.handle(SetupIPC.COMPLETE, () => setupDb.completeSetup());
  ipcMain.handle(SetupIPC.GET_UNITS, () => setupDb.getUnits());
  ipcMain.handle(SetupIPC.UPSERT_UNIT, (_event, unit: IUnitOfMeasure) => setupDb.upsertUnit(unit));
  ipcMain.handle(SetupIPC.DELETE_UNIT, (_event, id: string) => setupDb.deleteUnit(id));
  ipcMain.handle(SetupIPC.GET_GOOD_TYPES, () => setupDb.getGoodTypes());
  ipcMain.handle(SetupIPC.SET_GOOD_TYPES, (_event, types: string[]) => setupDb.setGoodTypes(types));
}

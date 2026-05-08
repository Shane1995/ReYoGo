import { SetupIPC } from '@shared/types/ipc';
import type { IUnitOfMeasure, ISetupStatus } from '@shared/types/contract/setup';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const setupService = {
  getStatus: (): Promise<ISetupStatus> => invoke()(SetupIPC.GET_STATUS),
  complete: (): Promise<void> => invoke()(SetupIPC.COMPLETE),
  getUnits: (): Promise<IUnitOfMeasure[]> => invoke()(SetupIPC.GET_UNITS),
  upsertUnit: (unit: IUnitOfMeasure): Promise<void> => invoke()(SetupIPC.UPSERT_UNIT, unit),
  deleteUnit: (id: string): Promise<void> => invoke()(SetupIPC.DELETE_UNIT, id),
  getGoodTypes: (): Promise<string[]> => invoke()(SetupIPC.GET_GOOD_TYPES),
  setGoodTypes: (types: string[]): Promise<void> => invoke()(SetupIPC.SET_GOOD_TYPES, types),
};

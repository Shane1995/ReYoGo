import { SetupIPC } from '@shared/types/ipc';
import type { IUnitOfMeasure } from '@reyogo/types/setup';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const setupService = {
  getUnits: (): Promise<IUnitOfMeasure[]> => invoke()(SetupIPC.GET_UNITS),
  upsertUnit: (unit: IUnitOfMeasure): Promise<void> => invoke()(SetupIPC.UPSERT_UNIT, unit),
  deleteUnit: (id: string): Promise<void> => invoke()(SetupIPC.DELETE_UNIT, id),
};

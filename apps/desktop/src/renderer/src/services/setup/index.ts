import { SetupIPC } from '@shared/types/ipc';
import type { UnitOfMeasure } from '@reyogo/types';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const setupService = {
  getUnits: (): Promise<UnitOfMeasure[]> => invoke()(SetupIPC.GET_UNITS),
  upsertUnit: (unit: UnitOfMeasure): Promise<void> => invoke()(SetupIPC.UPSERT_UNIT, unit),
  deleteUnit: (id: string): Promise<void> => invoke()(SetupIPC.DELETE_UNIT, id),
};

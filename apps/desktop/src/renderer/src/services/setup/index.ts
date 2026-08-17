import { SetupIPC } from '@shared/types/ipc';
import type { UnitOfMeasure } from '@reyogo/types';

export const setupService = {
  getUnits: (): Promise<UnitOfMeasure[]> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.GET_UNITS),
  getArchivedUnits: (): Promise<UnitOfMeasure[]> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.GET_ARCHIVED_UNITS),
  upsertUnit: (unit: UnitOfMeasure): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.UPSERT_UNIT, unit),
  archiveUnit: (id: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.ARCHIVE_UNIT, id),
  restoreUnit: (id: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.RESTORE_UNIT, id),
  hardDeleteUnit: (id: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.HARD_DELETE_UNIT, id),
  getUnitUsageCount: (id: string): Promise<number> =>
    window.electronAPI.ipcRenderer.invoke(SetupIPC.GET_UNIT_USAGE_COUNT, id),
};

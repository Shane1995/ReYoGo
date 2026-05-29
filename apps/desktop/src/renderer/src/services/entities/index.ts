import { EntitiesIPC } from '@shared/types/ipc';
import type { IBusinessGroup, ICompleteSetupPayload, IEntity, VatMode } from '@reyogo/types';

export const entitiesService = {
  getGroup: (): Promise<IBusinessGroup | null> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.GET_GROUP),
  getEntities: (): Promise<IEntity[]> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.GET_ENTITIES),
  getSetupState: (): Promise<{ setupComplete: boolean }> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.GET_SETUP_STATE),
  completeSetup: (payload: ICompleteSetupPayload): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.COMPLETE_SETUP, payload),
  updateGroupName: (name: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.UPDATE_GROUP_NAME, name),
  createEntity: (name: string): Promise<IEntity[]> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.CREATE_ENTITY, name),
  renameEntity: (entityId: string, name: string): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(EntitiesIPC.RENAME_ENTITY, entityId, name),
  updateEntityVat: (entityId: string, vatRate: number, vatMode: VatMode): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(
      EntitiesIPC.UPDATE_ENTITY_VAT,
      entityId,
      vatRate,
      vatMode,
    ),
};

import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import type { ICompleteSetupPayload, VatMode } from '@reyogo/types';
import { EntitiesIPC } from '@shared/types/ipc';
import { getRepos } from '../../db';

export function registerEntitiesHandlers(): void {
  ipcMain.handle(EntitiesIPC.GET_GROUP, () => getRepos().entities.getGroup('default'));
  ipcMain.handle(EntitiesIPC.GET_ENTITIES, () => getRepos().entities.getEntities('default'));
  ipcMain.handle(EntitiesIPC.GET_SETUP_STATE, () => getRepos().entities.getSetupState('default'));
  ipcMain.handle(EntitiesIPC.COMPLETE_SETUP, (_e, payload: ICompleteSetupPayload) =>
    getRepos().entities.completeSetup('default', payload.groupName, payload.entityNames),
  );
  ipcMain.handle(EntitiesIPC.UPDATE_GROUP_NAME, (_e, name: string) =>
    getRepos().entities.updateGroupName('default-group', name),
  );
  ipcMain.handle(EntitiesIPC.CREATE_ENTITY, async (_e, name: string) => {
    const id = randomUUID();
    await getRepos().entities.createEntity({ id, groupId: 'default-group', name });
    return getRepos().entities.getEntities('default');
  });
  ipcMain.handle(EntitiesIPC.RENAME_ENTITY, (_e, entityId: string, name: string) =>
    getRepos().entities.renameEntity(entityId, name),
  );
  ipcMain.handle(
    EntitiesIPC.UPDATE_ENTITY_VAT,
    (_e, entityId: string, vatRate: number, vatMode: VatMode) =>
      getRepos().entities.updateEntityVat(entityId, vatRate, vatMode),
  );
}

import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import type { ICompleteSetupPayload, VatMode } from '@reyogo/types';
import { EntitiesIPC } from '@shared/types/ipc';
import { ACCOUNT_ID, getRepos, resolveCurrentIds } from '../../db';

export function registerEntitiesHandlers(): void {
  ipcMain.handle(EntitiesIPC.GET_GROUP, () => getRepos().entities.getGroup(ACCOUNT_ID));
  ipcMain.handle(EntitiesIPC.GET_ENTITIES, () => getRepos().entities.getEntities(ACCOUNT_ID));
  ipcMain.handle(EntitiesIPC.GET_SETUP_STATE, () => getRepos().entities.getSetupState(ACCOUNT_ID));
  ipcMain.handle(EntitiesIPC.COMPLETE_SETUP, (_e, payload: ICompleteSetupPayload) =>
    getRepos().entities.completeSetup(ACCOUNT_ID, payload.groupName, payload.entityNames),
  );
  ipcMain.handle(EntitiesIPC.UPDATE_GROUP_NAME, async (_e, name: string) => {
    const { groupId } = await resolveCurrentIds();
    return getRepos().entities.updateGroupName(groupId, name);
  });
  ipcMain.handle(EntitiesIPC.CREATE_ENTITY, async (_e, name: string) => {
    const { groupId } = await resolveCurrentIds();
    const id = randomUUID();
    await getRepos().entities.createEntity({ id, groupId, name });
    return getRepos().entities.getEntities(ACCOUNT_ID);
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

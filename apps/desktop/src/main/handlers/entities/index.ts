import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import type { ICompleteSetupPayload, VatMode } from '@reyogo/types';
import { EntitiesIPC } from '@shared/types/ipc';
import { ACCOUNT_ID, getRepos, resolveCurrentIds } from '../../db';
import { scheduleDebouncedSync } from '../../db/syncScheduler';

export function registerEntitiesHandlers(): void {
  ipcMain.handle(EntitiesIPC.GET_GROUP, () => getRepos().entities.getGroup(ACCOUNT_ID));
  ipcMain.handle(EntitiesIPC.GET_ENTITIES, () => getRepos().entities.getEntities(ACCOUNT_ID));
  ipcMain.handle(EntitiesIPC.GET_SETUP_STATE, () => getRepos().entities.getSetupState(ACCOUNT_ID));
  ipcMain.handle(EntitiesIPC.COMPLETE_SETUP, async (_e, payload: ICompleteSetupPayload) => {
    const result = await getRepos().entities.completeSetup(
      ACCOUNT_ID,
      payload.groupName,
      payload.entityNames,
    );
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(EntitiesIPC.UPDATE_GROUP_NAME, async (_e, name: string) => {
    const { groupId } = await resolveCurrentIds();
    const result = await getRepos().entities.updateGroupName(groupId, name);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(EntitiesIPC.CREATE_ENTITY, async (_e, name: string) => {
    const { groupId } = await resolveCurrentIds();
    const id = randomUUID();
    await getRepos().entities.createEntity({ id, groupId, name });
    scheduleDebouncedSync();
    return getRepos().entities.getEntities(ACCOUNT_ID);
  });
  ipcMain.handle(EntitiesIPC.RENAME_ENTITY, async (_e, entityId: string, name: string) => {
    const result = await getRepos().entities.renameEntity(entityId, name);
    scheduleDebouncedSync();
    return result;
  });
  ipcMain.handle(
    EntitiesIPC.UPDATE_ENTITY_VAT,
    async (_e, entityId: string, vatRate: number, vatMode: VatMode) => {
      const result = await getRepos().entities.updateEntityVat(entityId, vatRate, vatMode);
      scheduleDebouncedSync();
      return result;
    },
  );
}

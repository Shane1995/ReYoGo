import { ipcMain } from 'electron';
import type { ISaveStocktakeLinePayload } from '@reyogo/types';
import { StocktakeIPC } from '@shared/types/ipc';
import { getRepos, resolveCurrentIds } from '../../db';
import { withSync } from '../../db/syncScheduler';

export function registerStocktakeHandlers(): void {
  ipcMain.handle(StocktakeIPC.CREATE_SESSION, (_e, label?: string) =>
    withSync(() => getRepos().stocktake.createSession(label)),
  );
  ipcMain.handle(StocktakeIPC.GET_SESSIONS, () => getRepos().stocktake.getSessions());
  ipcMain.handle(StocktakeIPC.GET_SESSION, (_e, id: string) =>
    getRepos().stocktake.getSessionById(id),
  );
  ipcMain.handle(
    StocktakeIPC.SAVE_DRAFT_LINES,
    (_e, sessionId: string, lines: ISaveStocktakeLinePayload[]) =>
      withSync(() => getRepos().stocktake.saveDraftLines(sessionId, lines)),
  );
  ipcMain.handle(
    StocktakeIPC.COMPLETE_SESSION,
    async (_e, sessionId: string, lines: ISaveStocktakeLinePayload[]) => {
      const { entityId } = await resolveCurrentIds();
      return withSync(() => getRepos().stocktake.completeSession({ sessionId, entityId, lines }));
    },
  );
}

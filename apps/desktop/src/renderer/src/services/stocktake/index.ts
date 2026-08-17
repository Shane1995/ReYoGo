import { StocktakeIPC } from '@shared/types/ipc';
import type {
  IStocktakeSession,
  IStocktakeSessionWithLines,
  ISaveStocktakeLinePayload,
} from '@reyogo/types';

export const stocktakeService = {
  createSession: (label?: string): Promise<IStocktakeSession> =>
    window.electronAPI.ipcRenderer.invoke(StocktakeIPC.CREATE_SESSION, label),
  getSessions: (): Promise<IStocktakeSession[]> =>
    window.electronAPI.ipcRenderer.invoke(StocktakeIPC.GET_SESSIONS),
  getSession: (id: string): Promise<IStocktakeSessionWithLines | null> =>
    window.electronAPI.ipcRenderer.invoke(StocktakeIPC.GET_SESSION, id),
  saveDraftLines: (sessionId: string, lines: ISaveStocktakeLinePayload[]): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(StocktakeIPC.SAVE_DRAFT_LINES, sessionId, lines),
  completeSession: (sessionId: string, lines: ISaveStocktakeLinePayload[]): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(StocktakeIPC.COMPLETE_SESSION, sessionId, lines),
};

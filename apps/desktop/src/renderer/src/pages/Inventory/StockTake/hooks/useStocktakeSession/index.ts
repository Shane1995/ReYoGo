import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type {
  IStocktakeSession,
  IStocktakeSessionWithLines,
  ISaveStocktakeLinePayload,
} from '@reyogo/types';
import { stocktakeService } from '@/services/stocktake';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';

export function useStocktakeSession() {
  const [sessions, setSessions] = useState<IStocktakeSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [currentSession, setCurrentSession] = useState<IStocktakeSessionWithLines | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      setSessions(await stocktakeService.getSessions());
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const selectSession = useCallback(async (id: string) => {
    setLoadingSession(true);
    try {
      setCurrentSession(await stocktakeService.getSession(id));
    } finally {
      setLoadingSession(false);
    }
  }, []);

  const createSession = useCallback(
    async (label?: string) => {
      const session = await stocktakeService.createSession(label);
      await loadSessions();
      await selectSession(session.id);
    },
    [loadSessions, selectSession],
  );

  const saveDraft = useCallback(
    async (lines: ISaveStocktakeLinePayload[]) => {
      if (!currentSession) return;
      setSaving(true);
      try {
        await stocktakeService.saveDraftLines(currentSession.id, lines);
        toast.success('Progress saved');
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to save progress'));
      } finally {
        setSaving(false);
      }
    },
    [currentSession],
  );

  const complete = useCallback(
    async (lines: ISaveStocktakeLinePayload[]) => {
      if (!currentSession) return;
      setCompleting(true);
      try {
        await stocktakeService.completeSession(currentSession.id, lines);
        toast.success('Stock count completed');
        await loadSessions();
        await selectSession(currentSession.id);
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to complete the stock count'));
      } finally {
        setCompleting(false);
      }
    },
    [currentSession, loadSessions, selectSession],
  );

  return {
    sessions,
    loadingSessions,
    currentSession,
    loadingSession,
    saving,
    completing,
    createSession,
    selectSession,
    saveDraft,
    complete,
  };
}

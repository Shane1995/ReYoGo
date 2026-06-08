import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cloudSyncService } from '@/services/cloudSync';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import { STAGE_LABEL } from '../constants';
import type { CloudSyncStatus } from '../types';

type SyncEventDeps = {
  refreshStatus: () => Promise<void>;
  setActivating: (v: boolean) => void;
  setProgressLabel: (v: string) => void;
  setProgressDetail: (v: string) => void;
};

type SyncEventHandler = (event: CloudSyncEvent, deps: SyncEventDeps) => void;

function clearProgress(deps: SyncEventDeps): void {
  deps.setActivating(false);
  deps.setProgressLabel('');
  deps.setProgressDetail('');
}

function handleProgressEvent(event: CloudSyncEvent, deps: SyncEventDeps): void {
  if (event.type !== CloudSyncEventType.Progress) return;
  deps.setProgressLabel(STAGE_LABEL[event.stage] ?? event.stage);
  deps.setProgressDetail(`${event.done}/${event.total}`);
}

function handleSuccessEvent(event: CloudSyncEvent, deps: SyncEventDeps): void {
  if (event.type !== CloudSyncEventType.Success) return;
  clearProgress(deps);
  deps.refreshStatus();
  toast.success('Cloud sync activated');
}

function handleBackgroundSyncEvent(event: CloudSyncEvent, deps: SyncEventDeps): void {
  if (event.type !== CloudSyncEventType.BackgroundSync) return;
  deps.refreshStatus();
}

function handleSyncingEvent(): void {}

function handleErrorEvent(event: CloudSyncEvent, deps: SyncEventDeps): void {
  if (event.type !== CloudSyncEventType.Error) return;
  clearProgress(deps);
  toast.error(event.message, event.retryable ? { description: 'You can try again.' } : undefined);
}

const SYNC_EVENT_HANDLERS: Record<CloudSyncEventType, SyncEventHandler> = {
  [CloudSyncEventType.Progress]: handleProgressEvent,
  [CloudSyncEventType.Success]: handleSuccessEvent,
  [CloudSyncEventType.Syncing]: handleSyncingEvent,
  [CloudSyncEventType.BackgroundSync]: handleBackgroundSyncEvent,
  [CloudSyncEventType.Error]: handleErrorEvent,
};

function dispatchSyncEvent(event: CloudSyncEvent, deps: SyncEventDeps): void {
  SYNC_EVENT_HANDLERS[event.type](event, deps);
}

function useSyncEvents(
  refreshStatus: () => Promise<void>,
  deps: Omit<SyncEventDeps, 'refreshStatus'>,
) {
  const { setActivating, setProgressLabel, setProgressDetail } = deps;
  useEffect(() => {
    let mounted = true;
    refreshStatus();
    const eventDeps: SyncEventDeps = {
      refreshStatus,
      setActivating,
      setProgressLabel,
      setProgressDetail,
    };
    const off = cloudSyncService.onSyncEvent((event: CloudSyncEvent) => {
      if (!mounted) return;
      dispatchSyncEvent(event, eventDeps);
    });
    return () => {
      mounted = false;
      off();
    };
  }, [refreshStatus, setActivating, setProgressLabel, setProgressDetail]);
}

function isBlank(value: string): boolean {
  return !value.trim();
}

function connectionErrorMessage(err: unknown): string {
  return ipcErrorMessage(err, 'Failed to update connection');
}

async function handleManualSync(refreshStatus: () => Promise<void>) {
  try {
    await cloudSyncService.manualSync();
    await refreshStatus();
    toast.success('Synced');
  } catch (err) {
    toast.error(ipcErrorMessage(err, 'Sync failed'));
  }
}

function lastSyncedLabelOf(status: CloudSyncStatus | null): string | null {
  if (!status?.lastSyncedAt) return null;
  return new Date(status.lastSyncedAt).toLocaleString();
}

function tursoUrlOf(credentials: { tursoUrl: string } | null): string | null {
  if (!credentials) return null;
  return credentials.tursoUrl;
}

export function useCloudSyncSection() {
  const [status, setStatus] = useState<CloudSyncStatus | null>(null);
  const [tursoUrl, setTursoUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [activating, setActivating] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const [progressDetail, setProgressDetail] = useState('');
  const [credentials, setCredentials] = useState<{ tursoUrl: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editToken, setEditToken] = useState('');
  const [connecting, setConnecting] = useState(false);

  const refreshStatus = useCallback(async () => {
    const [s, c] = await Promise.all([
      cloudSyncService.getStatus().catch(() => null),
      cloudSyncService.getCredentials().catch(() => null),
    ]);
    setStatus(s);
    setCredentials(c);
  }, []);

  useSyncEvents(refreshStatus, { setActivating, setProgressLabel, setProgressDetail });

  const handleActivate = useCallback(async () => {
    if (!tursoUrl.trim() || !authToken.trim()) {
      toast.error('Both Turso URL and auth token are required.');
      return;
    }
    setActivating(true);
    setProgressLabel('Starting…');
    try {
      await cloudSyncService.activate(tursoUrl.trim(), authToken.trim());
    } catch {
      setActivating(false);
      setProgressLabel('');
      setProgressDetail('');
    }
  }, [tursoUrl, authToken]);

  const handleManualSyncClick = useCallback(() => handleManualSync(refreshStatus), [refreshStatus]);

  const openEditModal = useCallback(() => {
    setEditUrl(tursoUrlOf(credentials) ?? '');
    setEditToken('');
    setShowEditModal(true);
  }, [credentials]);

  const closeEditModal = useCallback(() => setShowEditModal(false), []);

  const handleSaveConnection = useCallback(async () => {
    if (isBlank(editUrl) || isBlank(editToken)) {
      toast.error('Both URL and auth token are required.');
      return;
    }
    setConnecting(true);
    try {
      await cloudSyncService.connect(editUrl.trim(), editToken.trim());
      toast.success('Connection updated — reloading…');
      window.location.reload();
    } catch (err) {
      toast.error(connectionErrorMessage(err));
    } finally {
      setConnecting(false);
    }
  }, [editUrl, editToken]);

  return {
    status,
    tursoUrl,
    setTursoUrl,
    authToken,
    setAuthToken,
    activating,
    progressLabel,
    progressDetail,
    credentials,
    lastSynced: lastSyncedLabelOf(status),
    showEditModal,
    editUrl,
    setEditUrl,
    editToken,
    setEditToken,
    connecting,
    handleActivate,
    handleManualSync: handleManualSyncClick,
    openEditModal,
    closeEditModal,
    handleSaveConnection,
  };
}

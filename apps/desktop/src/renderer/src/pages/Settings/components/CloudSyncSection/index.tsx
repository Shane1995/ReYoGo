import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SectionHeader } from '../SectionHeader';
import { cloudSyncService } from '@/services/cloudSync';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import { STAGE_LABEL } from './constants';
import type { CloudSyncStatus } from './types';
import { ActivationForm } from './components/ActivationForm';
import { ActiveStatus } from './components/ActiveStatus';
import { EditConnectionModal } from './components/EditConnectionModal';

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
  setActivating: (v: boolean) => void,
  setProgressLabel: (v: string) => void,
  setProgressDetail: (v: string) => void,
) {
  useEffect(() => {
    let mounted = true;
    refreshStatus();
    const deps: SyncEventDeps = {
      refreshStatus,
      setActivating,
      setProgressLabel,
      setProgressDetail,
    };
    const off = cloudSyncService.onSyncEvent((event: CloudSyncEvent) => {
      if (!mounted) return;
      dispatchSyncEvent(event, deps);
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
  if (err instanceof Error) return err.message;
  return 'Failed to update connection';
}

function makeHandleSaveConnection(
  editUrl: string,
  editToken: string,
  setConnecting: (v: boolean) => void,
) {
  return async function handleSaveConnection() {
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
  };
}

async function handleActivate(
  tursoUrl: string,
  authToken: string,
  setActivating: (v: boolean) => void,
  setProgressLabel: (v: string) => void,
  setProgressDetail: (v: string) => void,
) {
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
}

async function handleManualSync(refreshStatus: () => Promise<void>) {
  try {
    await cloudSyncService.manualSync();
    await refreshStatus();
    toast.success('Synced');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Sync failed');
  }
}

function useCloudSyncHandlers(
  tursoUrl: string,
  authToken: string,
  editUrl: string,
  editToken: string,
  credentials: { tursoUrl: string } | null,
  refreshStatus: () => Promise<void>,
  setActivating: (v: boolean) => void,
  setProgressLabel: (v: string) => void,
  setProgressDetail: (v: string) => void,
  setShowEditModal: (v: boolean) => void,
  setEditUrl: (v: string) => void,
  setEditToken: (v: string) => void,
  setConnecting: (v: boolean) => void,
) {
  return {
    handleActivate: () =>
      handleActivate(tursoUrl, authToken, setActivating, setProgressLabel, setProgressDetail),
    handleManualSync: () => handleManualSync(refreshStatus),
    openEditModal: () => {
      setEditUrl(tursoUrlOf(credentials) ?? '');
      setEditToken('');
      setShowEditModal(true);
    },
    handleSaveConnection: makeHandleSaveConnection(editUrl, editToken, setConnecting),
  };
}

function lastSyncedLabelOf(status: CloudSyncStatus | null): string | null {
  if (!status?.lastSyncedAt) return null;
  return new Date(status.lastSyncedAt).toLocaleString();
}

function tursoUrlOf(credentials: { tursoUrl: string } | null): string | null {
  if (!credentials) return null;
  return credentials.tursoUrl;
}

function CloudSyncBody({
  status,
  tursoUrl,
  authToken,
  activating,
  progressLabel,
  progressDetail,
  credentials,
  lastSynced,
  onChangeTursoUrl,
  onChangeAuthToken,
  onActivate,
  onManualSync,
  onEditConnection,
}: {
  status: CloudSyncStatus | null;
  tursoUrl: string;
  authToken: string;
  activating: boolean;
  progressLabel: string;
  progressDetail: string;
  credentials: { tursoUrl: string } | null;
  lastSynced: string | null;
  onChangeTursoUrl: (v: string) => void;
  onChangeAuthToken: (v: string) => void;
  onActivate: () => void;
  onManualSync: () => void;
  onEditConnection: () => void;
}) {
  if (!status?.isActive) {
    return (
      <ActivationForm
        tursoUrl={tursoUrl}
        authToken={authToken}
        activating={activating}
        progressLabel={progressLabel}
        progressDetail={progressDetail}
        onChangeTursoUrl={onChangeTursoUrl}
        onChangeAuthToken={onChangeAuthToken}
        onActivate={onActivate}
      />
    );
  }
  return (
    <ActiveStatus
      status={status}
      tursoUrl={tursoUrlOf(credentials)}
      lastSynced={lastSynced}
      onManualSync={onManualSync}
      onEditConnection={onEditConnection}
    />
  );
}

export function CloudSyncSection() {
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

  useSyncEvents(refreshStatus, setActivating, setProgressLabel, setProgressDetail);

  const { handleActivate, handleManualSync, openEditModal, handleSaveConnection } =
    useCloudSyncHandlers(
      tursoUrl,
      authToken,
      editUrl,
      editToken,
      credentials,
      refreshStatus,
      setActivating,
      setProgressLabel,
      setProgressDetail,
      setShowEditModal,
      setEditUrl,
      setEditToken,
      setConnecting,
    );

  const lastSynced = lastSyncedLabelOf(status);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="Cloud Sync" />
      <CloudSyncBody
        status={status}
        tursoUrl={tursoUrl}
        authToken={authToken}
        activating={activating}
        progressLabel={progressLabel}
        progressDetail={progressDetail}
        credentials={credentials}
        lastSynced={lastSynced}
        onChangeTursoUrl={setTursoUrl}
        onChangeAuthToken={setAuthToken}
        onActivate={handleActivate}
        onManualSync={handleManualSync}
        onEditConnection={openEditModal}
      />
      <EditConnectionModal
        open={showEditModal}
        editUrl={editUrl}
        editToken={editToken}
        connecting={connecting}
        onChangeEditUrl={setEditUrl}
        onChangeEditToken={setEditToken}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveConnection}
      />
    </div>
  );
}

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

function useSyncEvents(
  refreshStatus: () => Promise<void>,
  setActivating: (v: boolean) => void,
  setProgressLabel: (v: string) => void,
  setProgressDetail: (v: string) => void,
) {
  useEffect(() => {
    let mounted = true;
    refreshStatus();
    const off = cloudSyncService.onSyncEvent((event: CloudSyncEvent) => {
      if (!mounted) return;
      if (event.type === CloudSyncEventType.Progress) {
        setProgressLabel(STAGE_LABEL[event.stage] ?? event.stage);
        setProgressDetail(`${event.done}/${event.total}`);
      } else if (event.type === CloudSyncEventType.Success) {
        setActivating(false);
        setProgressLabel('');
        setProgressDetail('');
        refreshStatus();
        toast.success('Cloud sync activated');
      } else if (event.type === CloudSyncEventType.BackgroundSync) {
        refreshStatus();
      } else if (event.type === CloudSyncEventType.Error) {
        setActivating(false);
        setProgressLabel('');
        setProgressDetail('');
        toast.error(
          event.message,
          event.retryable ? { description: 'You can try again.' } : undefined,
        );
      }
    });
    return () => {
      mounted = false;
      off();
    };
  }, [refreshStatus, setActivating, setProgressLabel, setProgressDetail]);
}

function makeHandleSaveConnection(
  editUrl: string,
  editToken: string,
  setConnecting: (v: boolean) => void,
) {
  return async function handleSaveConnection() {
    if (!editUrl.trim() || !editToken.trim()) {
      toast.error('Both URL and auth token are required.');
      return;
    }
    setConnecting(true);
    try {
      await cloudSyncService.connect(editUrl.trim(), editToken.trim());
      toast.success('Connection updated — reloading…');
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update connection');
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
      setEditUrl(credentials?.tursoUrl ?? '');
      setEditToken('');
      setShowEditModal(true);
    },
    handleSaveConnection: makeHandleSaveConnection(editUrl, editToken, setConnecting),
  };
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

  const lastSynced = status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : null;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="Cloud Sync" />
      {!status?.isActive ? (
        <ActivationForm
          tursoUrl={tursoUrl}
          authToken={authToken}
          activating={activating}
          progressLabel={progressLabel}
          progressDetail={progressDetail}
          onChangeTursoUrl={setTursoUrl}
          onChangeAuthToken={setAuthToken}
          onActivate={handleActivate}
        />
      ) : (
        <ActiveStatus
          status={status}
          tursoUrl={credentials?.tursoUrl ?? null}
          lastSynced={lastSynced}
          onManualSync={handleManualSync}
          onEditConnection={openEditModal}
        />
      )}
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

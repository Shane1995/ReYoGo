import { SectionHeader } from '../SectionHeader';
import type { CloudSyncStatus } from './types';
import { ActivationForm } from './components/ActivationForm';
import { ActiveStatus } from './components/ActiveStatus';
import { EditConnectionModal } from './components/EditConnectionModal';
import { useCloudSyncSection } from './useCloudSyncSection';

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
  const sync = useCloudSyncSection();

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="Cloud Sync" />
      <CloudSyncBody
        status={sync.status}
        tursoUrl={sync.tursoUrl}
        authToken={sync.authToken}
        activating={sync.activating}
        progressLabel={sync.progressLabel}
        progressDetail={sync.progressDetail}
        credentials={sync.credentials}
        lastSynced={sync.lastSynced}
        onChangeTursoUrl={sync.setTursoUrl}
        onChangeAuthToken={sync.setAuthToken}
        onActivate={sync.handleActivate}
        onManualSync={sync.handleManualSync}
        onEditConnection={sync.openEditModal}
      />
      <EditConnectionModal
        open={sync.showEditModal}
        editUrl={sync.editUrl}
        editToken={sync.editToken}
        connecting={sync.connecting}
        onChangeEditUrl={sync.setEditUrl}
        onChangeEditToken={sync.setEditToken}
        onClose={sync.closeEditModal}
        onSave={sync.handleSaveConnection}
      />
    </div>
  );
}

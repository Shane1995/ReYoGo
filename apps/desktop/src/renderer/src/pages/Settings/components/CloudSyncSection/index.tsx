import { useCallback, useEffect, useState } from 'react';
import { Button, Input } from '@reyogo/ui';
import { toast } from 'sonner';
import { SectionHeader } from '../SectionHeader';
import { cloudSyncService } from '@/services/cloudSync';
import { CloudSyncEventType, CloudSyncStage } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';

type Status = {
  state: string;
  lastSyncedAt: string | null;
  error: string | null;
  isActive: boolean;
};

const STAGE_LABEL: Record<CloudSyncStage, string> = {
  [CloudSyncStage.Migrating]: 'Applying schema to cloud…',
  [CloudSyncStage.Pushing]: 'Uploading your data…',
  [CloudSyncStage.Verifying]: 'Verifying data integrity…',
  [CloudSyncStage.Activating]: 'Activating cloud sync…',
  [CloudSyncStage.Syncing]: 'Syncing…',
};

export function CloudSyncSection() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tursoUrl, setTursoUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [activating, setActivating] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const [progressDetail, setProgressDetail] = useState('');
  const [credentials, setCredentials] = useState<{ tursoUrl: string } | null>(null);

  const refreshStatus = useCallback(async () => {
    const [s, c] = await Promise.all([
      cloudSyncService.getStatus(),
      cloudSyncService.getCredentials(),
    ]);
    setStatus(s);
    setCredentials(c);
  }, []);

  useEffect(() => {
    refreshStatus();
    const off = cloudSyncService.onSyncEvent((event: CloudSyncEvent) => {
      if (event.type === CloudSyncEventType.Progress) {
        setProgressLabel(STAGE_LABEL[event.stage] ?? event.stage);
        setProgressDetail(`${event.done}/${event.total}`);
      } else if (event.type === CloudSyncEventType.Success) {
        setActivating(false);
        setProgressLabel('');
        setProgressDetail('');
        refreshStatus();
        toast.success('Cloud sync activated');
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
    return off;
  }, [refreshStatus]);

  async function handleActivate() {
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

  async function handleManualSync() {
    try {
      await cloudSyncService.manualSync();
      await refreshStatus();
      toast.success('Synced');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
    }
  }

  async function handleDeleteBackup() {
    await cloudSyncService.deleteBackup();
    toast.success('Local backup deleted');
  }

  const lastSynced = status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : null;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="Cloud Sync" />

      {!status?.isActive ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enter your Turso database credentials to activate cloud sync. Your existing data will be
            migrated to the cloud and kept in sync across devices.
          </p>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="libsql://your-db.turso.io"
              value={tursoUrl}
              onChange={(e) => setTursoUrl(e.target.value)}
              disabled={activating}
            />
            <Input
              type="password"
              placeholder="Auth token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              disabled={activating}
            />
          </div>

          {activating && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-foreground">{progressLabel}</p>
              {progressDetail && <p className="text-xs text-muted-foreground">{progressDetail}</p>}
            </div>
          )}

          <Button onClick={handleActivate} disabled={activating} className="self-start">
            {activating ? 'Activating…' : 'Activate Cloud Sync'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Cloud sync is active.{lastSynced ? ` Last synced: ${lastSynced}.` : ''}
            {status.error && <span className="text-amber-500"> Sync error: {status.error}</span>}
          </p>
          {credentials?.tursoUrl && (
            <p className="text-xs text-muted-foreground break-all">DB: {credentials.tursoUrl}</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManualSync} className="self-start">
              Sync now
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeleteBackup}
              className="self-start text-destructive hover:text-destructive"
            >
              Delete local backup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

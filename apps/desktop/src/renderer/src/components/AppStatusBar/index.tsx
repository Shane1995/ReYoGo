import { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { cloudSyncService } from '@/services/cloudSync';
import { appService, type AppVersionInfo } from '@/services/app';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';

type SyncStatus = { isActive: boolean; lastSyncedAt: string | null };

export function AppStatusBar() {
  const [version, setVersion] = useState<AppVersionInfo | null>(null);
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    appService.getVersion().then(setVersion);
  }, []);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const status = await cloudSyncService.getStatus().catch(() => null);
      if (active && status)
        setSync({ isActive: status.isActive, lastSyncedAt: status.lastSyncedAt });
    };

    refresh();

    const off = cloudSyncService.onSyncEvent((event: CloudSyncEvent) => {
      if (!active) return;
      if (event.type === CloudSyncEventType.Syncing) {
        setSyncing(true);
      } else if (
        event.type === CloudSyncEventType.Success ||
        event.type === CloudSyncEventType.BackgroundSync
      ) {
        setSyncing(false);
        refresh();
      } else if (event.type === CloudSyncEventType.Error) {
        setSyncing(false);
      }
    });

    return () => {
      active = false;
      off();
    };
  }, []);

  const connected = sync?.isActive ?? false;

  return (
    <div
      className="flex shrink-0 items-center border-t border-[rgba(255,255,255,0.07)] px-4 py-1 text-xs text-[rgba(255,255,255,0.4)]"
      style={{
        background: 'rgba(13,17,23,0.88)',
        backdropFilter: 'blur(28px) saturate(200%)',
      }}
    >
      <div className="ml-auto flex items-center gap-2">
        {connected ? (
          <Cloud className="size-3.5 shrink-0 text-green-500" aria-hidden />
        ) : (
          <CloudOff className="size-3.5 shrink-0" aria-hidden />
        )}
        <span>
          {syncing ? 'Syncing database…' : connected ? 'Cloud connected' : 'Local only'}
          {!syncing && version && ` · v${version.version}`}
        </span>
      </div>
    </div>
  );
}

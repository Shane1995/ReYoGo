import { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { cloudSyncService } from '@/services/cloudSync';
import { appService, type AppVersionInfo } from '@/services/app';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';

type SyncStatus = { isActive: boolean; lastSyncedAt: string | null };

export function AppStatusBar({ collapsed }: { collapsed: boolean }) {
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
      className={cn(
        'flex shrink-0 items-center border-t border-[rgba(255,255,255,0.07)] px-3 py-2 text-xs text-[rgba(255,255,255,0.35)]',
        collapsed ? 'justify-center' : 'gap-2',
      )}
    >
      {connected ? (
        <Cloud className="size-3.5 shrink-0 text-green-500" aria-hidden />
      ) : (
        <CloudOff className="size-3.5 shrink-0" aria-hidden />
      )}
      {!collapsed && (
        <span className="truncate">
          {syncing ? 'Syncing database…' : connected ? 'Cloud connected' : 'Local only'}
          {!syncing && version && ` · v${version.version}`}
        </span>
      )}
    </div>
  );
}

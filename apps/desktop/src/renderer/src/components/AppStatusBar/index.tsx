import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cloudSyncService } from '@/services/cloudSync';
import { appService, type AppVersionInfo } from '@/services/app';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';

type SyncStatus = {
  isActive: boolean;
  lastSyncedAt: string | null;
  state: string;
  error: string | null;
};

function syncLabel(sync: SyncStatus | null, syncing: boolean, isOnline: boolean): string {
  if (!sync?.isActive) return 'Local only';
  if (!isOnline) return 'Offline';
  if (syncing) return 'Syncing…';
  if (sync.state === 'error') return 'Sync failed';
  return 'Connected';
}

const iconTransition = { duration: 0.15 };
const spinTransition = {
  rotate: { repeat: Infinity, duration: 1, ease: 'linear' as const },
  opacity: iconTransition,
  scale: iconTransition,
};

function useSyncState(): { sync: SyncStatus | null; syncing: boolean } {
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const status = await cloudSyncService.getStatus().catch(() => null);
      if (active && status)
        setSync({
          isActive: status.isActive,
          lastSyncedAt: status.lastSyncedAt,
          state: status.state,
          error: status.error,
        });
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
        refresh();
      }
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  return { sync, syncing };
}

function SyncIcon({ syncing, connected }: { syncing: boolean; connected: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {syncing ? (
        <motion.div
          key="syncing"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={spinTransition}
        >
          <Loader2 className="size-3.5 shrink-0 text-[#20C997]" aria-hidden />
        </motion.div>
      ) : connected ? (
        <motion.div
          key="connected"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={iconTransition}
        >
          <Cloud className="size-3.5 shrink-0 text-[#20C997]" aria-hidden />
        </motion.div>
      ) : (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={iconTransition}
        >
          <CloudOff className="size-3.5 shrink-0" aria-hidden />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AppStatusBar() {
  const [version, setVersion] = useState<AppVersionInfo | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { sync, syncing } = useSyncState();

  useEffect(() => {
    appService.getVersion().then(setVersion);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const label = syncLabel(sync, syncing, isOnline);
  const connected = sync?.isActive === true && isOnline && sync.state !== 'error' && !syncing;

  return (
    <div
      className="flex shrink-0 items-center border-t border-[rgba(255,255,255,0.07)] px-4 py-1 text-xs text-[rgba(255,255,255,0.4)]"
      style={{ background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(28px) saturate(200%)' }}
    >
      <div className="ml-auto flex items-center gap-2">
        <SyncIcon syncing={syncing} connected={connected} />
        <span>
          {label}
          {!syncing && version && ` · v${version.version}`}
        </span>
      </div>
    </div>
  );
}

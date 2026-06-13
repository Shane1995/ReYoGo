import { useEffect, useState } from 'react';
import { appService, type AppVersionInfo } from '@/services/app';
import { SyncIcon } from './components/SyncIcon';
import { useSyncState } from './hooks/useSyncState';
import { syncLabel } from './utils/syncLabel';
import { isConnected } from './utils/isConnected';
import { versionSuffix } from './utils/versionSuffix';

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
  const connected = isConnected(sync, syncing, isOnline);

  return (
    <div
      className="flex shrink-0 items-center border-t border-[rgba(255,255,255,0.07)] px-4 py-1 text-xs text-[rgba(255,255,255,0.4)]"
      style={{ background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(28px) saturate(200%)' }}
    >
      <div className="ml-auto flex items-center gap-2">
        <SyncIcon syncing={syncing} connected={connected} />
        <span>
          {label}
          {versionSuffix(syncing, version)}
        </span>
      </div>
    </div>
  );
}

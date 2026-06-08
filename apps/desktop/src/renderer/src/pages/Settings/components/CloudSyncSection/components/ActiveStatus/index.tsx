import { Button } from '@reyogo/ui';
import type { CloudSyncStatus } from '../../types';

type Props = {
  status: CloudSyncStatus;
  tursoUrl: string | null;
  lastSynced: string | null;
  onManualSync: () => void;
  onEditConnection: () => void;
};

export function ActiveStatus({
  status,
  tursoUrl,
  lastSynced,
  onManualSync,
  onEditConnection,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Cloud sync is active.{lastSynced ? ` Last synced: ${lastSynced}.` : ''}
        {status.error && <span className="text-amber-500"> Sync error: {status.error}</span>}
      </p>
      {tursoUrl && <p className="text-xs text-muted-foreground break-all">DB: {tursoUrl}</p>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onManualSync} className="self-start">
          Sync now
        </Button>
        <Button variant="ghost" onClick={onEditConnection} className="self-start">
          Edit connection
        </Button>
      </div>
    </div>
  );
}

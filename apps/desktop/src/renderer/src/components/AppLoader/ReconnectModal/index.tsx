import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
} from '@reyogo/ui';
import { cloudSyncService } from '@/services/cloudSync';

interface ReconnectModalProps {
  authError: string | null;
}

export function ReconnectModal({ authError }: ReconnectModalProps) {
  const [tursoUrl, setTursoUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const canConnect = tursoUrl.trim().startsWith('libsql://') && authToken.trim().length > 0;

  const handleConnect = useCallback(async () => {
    if (!canConnect || connecting) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await cloudSyncService.connect(tursoUrl.trim(), authToken.trim());
      window.location.reload();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
      setConnecting(false);
    }
  }, [tursoUrl, authToken, canConnect, connecting]);

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Cloud connection lost</DialogTitle>
          <DialogDescription>
            Your database connection failed. Enter your Turso credentials to reconnect.
          </DialogDescription>
        </DialogHeader>

        {authError && (
          <code className="block rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive break-all leading-relaxed">
            {authError}
          </code>
        )}

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reconnect-url">Database URL</Label>
            <Input
              id="reconnect-url"
              value={tursoUrl}
              onChange={(e) => setTursoUrl(e.target.value)}
              placeholder="libsql://your-db.turso.io"
              disabled={connecting}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reconnect-token">Auth token</Label>
            <Input
              id="reconnect-token"
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="eyJhbGci…"
              disabled={connecting}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>

          {connectError && <p className="text-sm text-destructive">{connectError}</p>}
        </div>

        <DialogFooter>
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            onClick={handleConnect}
            disabled={!canConnect || connecting}
          >
            {connecting ? 'Connecting…' : 'Reconnect'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

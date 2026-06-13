import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@reyogo/ui';
import { cloudSyncService } from '@/services/cloudSync';
import type { ReconnectModalProps } from './types';
import { reconnectErrorMessage } from './utils/reconnectErrorMessage';
import { ReconnectButton } from './components/ReconnectButton';
import { CredentialsForm } from './components/CredentialsForm';

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
      setConnectError(reconnectErrorMessage(err));
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

        <CredentialsForm
          tursoUrl={tursoUrl}
          authToken={authToken}
          connecting={connecting}
          connectError={connectError}
          onUrlChange={setTursoUrl}
          onTokenChange={setAuthToken}
          onConnect={handleConnect}
        />

        <DialogFooter>
          <ReconnectButton
            connecting={connecting}
            canConnect={canConnect}
            onClick={handleConnect}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

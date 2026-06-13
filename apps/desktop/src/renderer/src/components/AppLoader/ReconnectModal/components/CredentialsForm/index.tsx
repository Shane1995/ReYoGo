import { Input, Label } from '@reyogo/ui';
import type { CredentialsFormProps } from './types';

export function CredentialsForm({
  tursoUrl,
  authToken,
  connecting,
  connectError,
  onUrlChange,
  onTokenChange,
  onConnect,
}: CredentialsFormProps) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reconnect-url">Database URL</Label>
        <Input
          id="reconnect-url"
          value={tursoUrl}
          onChange={(e) => onUrlChange(e.target.value)}
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
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="eyJhbGci…"
          disabled={connecting}
          onKeyDown={(e) => e.key === 'Enter' && onConnect()}
        />
      </div>
      {connectError && <p className="text-sm text-destructive">{connectError}</p>}
    </div>
  );
}

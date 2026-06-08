import { Button, Input } from '@reyogo/ui';

type Props = {
  tursoUrl: string;
  authToken: string;
  activating: boolean;
  progressLabel: string;
  progressDetail: string;
  onChangeTursoUrl: (v: string) => void;
  onChangeAuthToken: (v: string) => void;
  onActivate: () => void;
};

export function ActivationForm({
  tursoUrl,
  authToken,
  activating,
  progressLabel,
  progressDetail,
  onChangeTursoUrl,
  onChangeAuthToken,
  onActivate,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Enter your Turso database credentials to activate cloud sync. Your existing data will be
        migrated to the cloud and kept in sync across devices.
      </p>
      <div className="flex flex-col gap-2">
        <Input
          placeholder="libsql://your-db.turso.io"
          value={tursoUrl}
          onChange={(e) => onChangeTursoUrl(e.target.value)}
          disabled={activating}
        />
        <Input
          type="password"
          placeholder="Auth token"
          value={authToken}
          onChange={(e) => onChangeAuthToken(e.target.value)}
          disabled={activating}
        />
      </div>

      {activating && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-foreground">{progressLabel}</p>
          {progressDetail && <p className="text-xs text-muted-foreground">{progressDetail}</p>}
        </div>
      )}

      <Button onClick={onActivate} disabled={activating} className="self-start">
        {activating ? 'Activating…' : 'Activate Cloud Sync'}
      </Button>
    </div>
  );
}

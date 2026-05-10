import { useEffect, useState } from 'react';
import { appService, type AppVersionInfo } from '../../services/app';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@reyogo/ui';

type CheckState = 'idle' | 'checking' | 'up-to-date' | 'downloading' | 'error';

export default function VersionBar() {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    appService.getVersion().then(setInfo);
    const cleanup = appService.onUpdateError((message) => {
      setErrorMessage(message);
    });
    return cleanup;
  }, []);

  async function handleCheck() {
    setCheckState('checking');
    try {
      const { hasUpdate } = await appService.checkForUpdates();
      setCheckState(hasUpdate ? 'downloading' : 'up-to-date');
      if (!hasUpdate) setTimeout(() => setCheckState('idle'), 3000);
    } catch (err) {
      setCheckState('idle');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (!info) return null;

  const envLabel = info.env.charAt(0).toUpperCase() + info.env.slice(1);

  const checkLabel: Record<CheckState, string> = {
    idle: 'Check for updates',
    checking: 'Checking…',
    'up-to-date': "You're up to date ✓",
    downloading: 'Downloading…',
    error: 'Check failed',
  };

  return (
    <>
      <div className="flex items-center justify-between border-t border-border bg-background px-4 py-1 text-xs text-muted-foreground">
        <span>
          v{info.version} • {envLabel}
        </span>
        <button
          type="button"
          onClick={handleCheck}
          disabled={checkState === 'checking' || checkState === 'downloading'}
          className="hover:text-foreground disabled:opacity-50 transition-colors"
        >
          {checkLabel[checkState]}
        </button>
      </div>

      <Dialog open={errorMessage !== null} onOpenChange={() => setErrorMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update failed</DialogTitle>
            <DialogDescription>
              An error occurred while checking for or downloading an update.
            </DialogDescription>
          </DialogHeader>
          <pre className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {errorMessage}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}

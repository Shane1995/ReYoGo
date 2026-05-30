import { useEffect, useState } from 'react';
import { Button } from '@reyogo/ui';
import { appService } from '@/services/app';
import { SectionHeader } from '../SectionHeader';

enum CheckState {
  Idle = 'idle',
  Checking = 'checking',
  UpToDate = 'up-to-date',
  Downloading = 'downloading',
}

const checkLabel: Record<CheckState, string> = {
  [CheckState.Idle]: 'Check for updates',
  [CheckState.Checking]: 'Checking…',
  [CheckState.UpToDate]: "You're up to date ✓",
  [CheckState.Downloading]: 'Downloading…',
};

export function AboutSection() {
  const [version, setVersion] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<CheckState>(CheckState.Idle);

  useEffect(() => {
    appService.getVersion().then((info) => setVersion(info.version));
    const off = appService.onUpdateDownloaded(() => setCheckState(CheckState.Downloading));
    return off;
  }, []);

  async function handleCheck() {
    setCheckState(CheckState.Checking);
    const { hasUpdate } = await appService.checkForUpdates();
    setCheckState(hasUpdate ? CheckState.Downloading : CheckState.UpToDate);
    if (!hasUpdate) setTimeout(() => setCheckState(CheckState.Idle), 3000);
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="About" />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{version ? `v${version}` : '—'}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCheck}
          disabled={checkState === CheckState.Checking || checkState === CheckState.Downloading}
        >
          {checkLabel[checkState]}
        </Button>
      </div>
    </div>
  );
}

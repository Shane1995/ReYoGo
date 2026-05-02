import { useEffect, useState } from 'react';
import { appService, type AppVersionInfo } from '../../services/app';

export default function VersionBar() {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);

  useEffect(() => {
    appService.getVersion().then(setInfo);
  }, []);

  if (!info) return null;

  const envLabel = info.env.charAt(0).toUpperCase() + info.env.slice(1);

  return (
    <div className="flex items-center justify-end border-t border-border bg-background px-4 py-1 text-xs text-muted-foreground">
      v{info.version} • {envLabel}
    </div>
  );
}

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import { appService } from '../../services/app';

export default function UpdateToast() {
  const { updateReady } = useAutoUpdater();

  useEffect(() => {
    if (!updateReady) return;
    toast('Update ready — Restart to apply', {
      duration: Infinity,
      action: {
        label: 'Restart now',
        onClick: () => appService.installUpdate(),
      },
    });
  }, [updateReady]);

  return null;
}

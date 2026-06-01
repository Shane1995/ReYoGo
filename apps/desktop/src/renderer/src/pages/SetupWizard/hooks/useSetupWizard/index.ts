import { useCallback, useEffect, useState } from 'react';
import { cloudSyncService } from '@/services/cloudSync';
import { entitiesService } from '@/services/entities';

export function useSetupWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [tursoUrl, setTursoUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');

  const [moreBusinesses, setMoreBusinesses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    cloudSyncService.getStatus().then((status) => {
      if (status.isActive) setStep(2);
    });
  }, []);

  const connect = useCallback(async () => {
    if (!tursoUrl.trim() || !authToken.trim()) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await cloudSyncService.connect(tursoUrl, authToken);
      setStep(2);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
    } finally {
      setConnecting(false);
    }
  }, [tursoUrl, authToken]);

  const next = useCallback(() => {
    if (businessName.trim()) setStep(3);
  }, [businessName]);

  const back = useCallback(() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s)), []);

  const addMore = useCallback(() => setMoreBusinesses((prev) => [...prev, '']), []);

  const removeMore = useCallback((index: number) => {
    setMoreBusinesses((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setMoreName = useCallback((index: number, name: string) => {
    setMoreBusinesses((prev) => prev.map((n, i) => (i === index ? name : n)));
  }, []);

  const doSubmit = useCallback(
    async (extras: string[]) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const entityNames = [
          businessName.trim(),
          ...extras.filter((n) => n.trim()).map((n) => n.trim()),
        ];
        await entitiesService.completeSetup({
          groupName: `${businessName.trim()} Group`,
          entityNames,
        });
        window.location.reload();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [businessName],
  );

  const skip = useCallback(() => doSubmit([]), [doSubmit]);
  const submit = useCallback(() => doSubmit(moreBusinesses), [doSubmit, moreBusinesses]);

  return {
    step,
    tursoUrl,
    setTursoUrl,
    authToken,
    setAuthToken,
    connecting,
    connectError,
    connect,
    businessName,
    setBusinessName,
    next,
    back,
    moreBusinesses,
    addMore,
    removeMore,
    setMoreName,
    isSubmitting,
    submitError,
    skip,
    submit,
  };
}

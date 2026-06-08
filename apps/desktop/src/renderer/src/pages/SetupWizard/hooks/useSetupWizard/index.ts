import { useCallback, useState } from 'react';
import { cloudSyncService } from '@/services/cloudSync';
import { entitiesService } from '@/services/entities';

function useCloudConnect(onConnected: () => void) {
  const [tursoUrl, setTursoUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!tursoUrl.trim() || !authToken.trim()) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await cloudSyncService.connect(tursoUrl, authToken);
      const { setupComplete } = await entitiesService.getSetupState();
      if (setupComplete) {
        window.location.reload();
      } else {
        onConnected();
      }
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
    } finally {
      setConnecting(false);
    }
  }, [tursoUrl, authToken, onConnected]);

  return { tursoUrl, setTursoUrl, authToken, setAuthToken, connecting, connectError, connect };
}

function useBusinessSetup(businessName: string) {
  const [moreBusinesses, setMoreBusinesses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        await entitiesService.completeSetup({
          groupName: `${businessName.trim()} Group`,
          entityNames: [
            businessName.trim(),
            ...extras.filter((n) => n.trim()).map((n) => n.trim()),
          ],
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

export function useSetupWizard({ initialStep = 1 }: { initialStep?: 1 | 2 } = {}) {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [businessName, setBusinessName] = useState('');

  const cloud = useCloudConnect(() => setStep(2));
  const business = useBusinessSetup(businessName);

  const next = useCallback(() => {
    if (businessName.trim()) setStep(3);
  }, [businessName]);
  const back = useCallback(() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s)), []);

  return {
    step,
    ...cloud,
    businessName,
    setBusinessName,
    next,
    back,
    ...business,
  };
}

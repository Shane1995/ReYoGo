import { useCallback, useState } from 'react';
import { entitiesService } from '@/services/entities';
import { cloudSyncService } from '@/services/cloudSync';
import { SetupPath } from '../..';

export type WizardPath = SetupPath | null;

export function useSetupWizard() {
  const [step, setStep] = useState(1);
  const [path, setPath] = useState<WizardPath>(null);

  const [groupName, setGroupName] = useState('');
  const [entityNames, setEntityNames] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [tursoUrl, setTursoUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const choosePath = useCallback((p: SetupPath) => {
    setPath(p);
    setStep(2);
  }, []);

  const next = useCallback(() => {
    setStep((s) => (s === 2 && path === SetupPath.Local && groupName.trim() ? s + 1 : s));
  }, [path, groupName]);

  const back = useCallback(() => {
    setStep((s) => (s > 1 ? s - 1 : s));
  }, []);

  const addEntity = useCallback(() => {
    setEntityNames((prev) => [...prev, '']);
  }, []);

  const removeEntity = useCallback((index: number) => {
    setEntityNames((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const setEntityName = useCallback((index: number, name: string) => {
    setEntityNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }, []);

  const canSubmit = entityNames.some((n) => n.trim().length > 0);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await entitiesService.completeSetup({
        groupName: groupName.trim(),
        entityNames: entityNames.filter((n) => n.trim()).map((n) => n.trim()),
      });
      window.location.reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, groupName, entityNames]);

  const connect = useCallback(async () => {
    if (!tursoUrl.trim() || !authToken.trim()) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await cloudSyncService.connect(tursoUrl, authToken);
      window.location.reload();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
    } finally {
      setConnecting(false);
    }
  }, [tursoUrl, authToken]);

  return {
    step,
    path,
    choosePath,
    groupName,
    setGroupName,
    entityNames,
    addEntity,
    removeEntity,
    setEntityName,
    canSubmit,
    isSubmitting,
    submitError,
    next,
    back,
    submit,
    tursoUrl,
    setTursoUrl,
    authToken,
    setAuthToken,
    connecting,
    connectError,
    connect,
  };
}

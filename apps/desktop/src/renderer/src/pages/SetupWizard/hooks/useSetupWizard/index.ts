import { useCallback, useState } from 'react';
import { entitiesService } from '@/services/entities';

export function useSetupWizard() {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [entityNames, setEntityNames] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const next = useCallback(() => {
    if (step === 1 && groupName.trim()) setStep(2);
  }, [step, groupName]);

  const back = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

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

  return {
    step,
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
  };
}

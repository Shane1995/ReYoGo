export function setupWizardStepOf(cloudConnected: boolean): 1 | 2 {
  if (cloudConnected) return 2;
  return 1;
}

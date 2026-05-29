import { useSetupWizard } from './hooks/useSetupWizard';
import { GroupStep } from './components/GroupStep';
import { EntitiesStep } from './components/EntitiesStep';

export default function SetupWizard() {
  const wizard = useSetupWizard();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-xs text-muted-foreground text-center mb-8">
          Step {wizard.step} of 2
        </div>
        {wizard.step === 1 && (
          <GroupStep
            groupName={wizard.groupName}
            onGroupNameChange={wizard.setGroupName}
            onNext={wizard.next}
          />
        )}
        {wizard.step === 2 && (
          <EntitiesStep
            entityNames={wizard.entityNames}
            onAdd={wizard.addEntity}
            onRemove={wizard.removeEntity}
            onNameChange={wizard.setEntityName}
            onBack={wizard.back}
            onSubmit={wizard.submit}
            canSubmit={wizard.canSubmit}
            isSubmitting={wizard.isSubmitting}
            submitError={wizard.submitError}
          />
        )}
      </div>
    </div>
  );
}

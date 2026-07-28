import { SectionHeader } from '../SectionHeader';
import { ClearKeyDialog } from './components/ClearKeyDialog';
import { ConfiguredStatus } from './components/ConfiguredStatus';
import { KeyForm } from './components/KeyForm';
import { useAISettingsSection } from './useAISettingsSection';

export function AISettingsSection() {
  const ai = useAISettingsSection();

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="AI" />
      {ai.configured ? (
        <ConfiguredStatus onClear={ai.openClearConfirm} />
      ) : (
        <KeyForm
          apiKey={ai.apiKey}
          testing={ai.testing}
          testResult={ai.testResult}
          saving={ai.saving}
          canSave={ai.canSave}
          onChangeApiKey={ai.setApiKey}
          onTestConnection={ai.handleTestConnection}
          onSave={ai.handleSave}
        />
      )}
      <ClearKeyDialog
        open={ai.showClearConfirm}
        clearing={ai.clearing}
        onClose={ai.closeClearConfirm}
        onConfirm={ai.handleConfirmClear}
      />
    </div>
  );
}

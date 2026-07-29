import { Button, Input } from '@reyogo/ui';
import { API_KEY_PLACEHOLDER } from '../../constants';
import { TestResultBadge } from './components/TestResultBadge';
import type { TestConnectionResult } from '../../types';

type Props = {
  apiKey: string;
  testing: boolean;
  testResult: TestConnectionResult;
  saving: boolean;
  canSave: boolean;
  onChangeApiKey: (v: string) => void;
  onTestConnection: () => void;
  onSave: () => void;
};

function isFormBusy(testing: boolean, saving: boolean): boolean {
  return testing || saving;
}

function isTestDisabled(testing: boolean, saving: boolean, apiKey: string): boolean {
  return testing || saving || !apiKey.trim();
}

function testButtonLabel(testing: boolean): string {
  return testing ? 'Testing…' : 'Test Connection';
}

function saveButtonLabel(saving: boolean): string {
  return saving ? 'Saving…' : 'Save';
}

export function KeyForm({
  apiKey,
  testing,
  testResult,
  saving,
  canSave,
  onChangeApiKey,
  onTestConnection,
  onSave,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Add your own Anthropic API key to enable AI features, like invoice scanning. Your key is
        encrypted at rest and never leaves your device except to call Anthropic directly.
      </p>
      <Input
        type="password"
        placeholder={API_KEY_PLACEHOLDER}
        value={apiKey}
        onChange={(e) => onChangeApiKey(e.target.value)}
        disabled={isFormBusy(testing, saving)}
      />
      <TestResultBadge testResult={testResult} />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onTestConnection}
          disabled={isTestDisabled(testing, saving, apiKey)}
        >
          {testButtonLabel(testing)}
        </Button>
        <Button onClick={onSave} disabled={!canSave}>
          {saveButtonLabel(saving)}
        </Button>
      </div>
    </div>
  );
}

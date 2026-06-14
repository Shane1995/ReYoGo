import { Button } from '@reyogo/ui';
import { draftLabelOf } from './utils/draftLabelOf';
import { postLabelOf } from './utils/postLabelOf';
import type { SaveButtonsProps } from './types';

export function SaveButtons({
  isSaving,
  isSavingDraft,
  canSave,
  onSave,
  onSaveDraft,
}: SaveButtonsProps) {
  const disabled = isSaving || isSavingDraft || !canSave;
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSaveDraft}
        disabled={disabled}
        className="min-w-[100px] text-muted-foreground"
      >
        {draftLabelOf(isSavingDraft)}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={disabled}
        className="min-w-[110px]"
      >
        {postLabelOf(isSaving)}
      </Button>
    </div>
  );
}

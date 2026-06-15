export type SaveButtonsProps = {
  isSaving: boolean;
  isSavingDraft: boolean;
  canSave: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
};

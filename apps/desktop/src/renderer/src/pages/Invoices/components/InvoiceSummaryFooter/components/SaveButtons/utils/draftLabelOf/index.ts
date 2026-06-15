export function draftLabelOf(isSavingDraft: boolean): string {
  if (isSavingDraft) return 'Saving…';
  return 'Save draft';
}

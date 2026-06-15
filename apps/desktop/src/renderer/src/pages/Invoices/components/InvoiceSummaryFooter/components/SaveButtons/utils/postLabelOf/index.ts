export function postLabelOf(isSaving: boolean): string {
  if (isSaving) return 'Posting…';
  return 'Post invoice';
}

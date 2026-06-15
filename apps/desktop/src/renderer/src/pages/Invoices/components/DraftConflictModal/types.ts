export type DraftConflictModalProps = {
  open: boolean;
  draftItemCount: number;
  onAppend: () => void;
  onFresh: () => void;
  onCancel: () => void;
};

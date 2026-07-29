import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@reyogo/ui';

type Props = {
  open: boolean;
  clearing: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ClearKeyDialog({ open, clearing, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Anthropic API key?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          AI invoice scanning will be disabled until you add a new key.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={clearing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={clearing}>
            {clearing ? 'Removing…' : 'Remove key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

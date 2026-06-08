import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@reyogo/ui';

type Props = {
  open: boolean;
  editUrl: string;
  editToken: string;
  connecting: boolean;
  onChangeEditUrl: (v: string) => void;
  onChangeEditToken: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function EditConnectionModal({
  open,
  editUrl,
  editToken,
  connecting,
  onChangeEditUrl,
  onChangeEditToken,
  onClose,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit connection</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Database URL</label>
            <Input
              placeholder="libsql://your-db.turso.io"
              value={editUrl}
              onChange={(e) => onChangeEditUrl(e.target.value)}
              disabled={connecting}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Auth token</label>
            <Input
              type="password"
              placeholder="Paste your auth token"
              value={editToken}
              onChange={(e) => onChangeEditToken(e.target.value)}
              disabled={connecting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={connecting}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={connecting}>
            {connecting ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

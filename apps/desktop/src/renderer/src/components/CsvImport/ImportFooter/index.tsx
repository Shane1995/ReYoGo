import { Button } from '@reyogo/ui';

export function ImportFooter({
  selectedNew,
  commitLabel,
  onCommit,
  onCancel,
}: {
  selectedNew: number;
  commitLabel: string;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const summary =
    selectedNew > 0
      ? `${selectedNew} row${selectedNew !== 1 ? 's' : ''} selected to import`
      : 'Nothing selected';

  return (
    <div className="flex items-center justify-between pt-1">
      <p className="text-xs text-muted-foreground">{summary}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="success"
          size="sm"
          disabled={selectedNew === 0}
          onClick={onCommit}
        >
          {commitLabel}
        </Button>
      </div>
    </div>
  );
}

import { Button, Input } from '@reyogo/ui';

interface EntitiesStepProps {
  entityNames: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onNameChange: (i: number, v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}

export function EntitiesStep({
  entityNames,
  onAdd,
  onRemove,
  onNameChange,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: EntitiesStepProps) {
  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Add your venues</h1>
        <p className="text-sm text-muted-foreground">
          Each venue is a separate legal trading entity. You need at least one.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {entityNames.map((name, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={name}
              onChange={(e) => onNameChange(i, e.target.value)}
              placeholder={`Venue ${i + 1}`}
              autoFocus={i === entityNames.length - 1}
            />
            {entityNames.length > 1 && (
              <button
                onClick={() => onRemove(i)}
                className="text-muted-foreground hover:text-white transition-colors px-2"
                aria-label="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAdd}
          className="text-sm text-muted-foreground hover:text-white border border-dashed border-border rounded-lg px-4 py-2 transition-colors text-left"
        >
          + Add another venue
        </button>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Setting up…' : 'Get started'}
        </Button>
      </div>
    </div>
  );
}

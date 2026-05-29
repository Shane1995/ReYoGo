import { Button, Input } from '@reyogo/ui';

interface GroupStepProps {
  groupName: string;
  onGroupNameChange: (v: string) => void;
  onNext: () => void;
}

export function GroupStep({ groupName, onGroupNameChange, onNext }: GroupStepProps) {
  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Welcome to ReYoGo</h1>
        <p className="text-sm text-muted-foreground">
          Start with the name of your business group — the umbrella for all your venues.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Business group name
        </label>
        <Input
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="e.g. The Crown Group"
          onKeyDown={(e) => e.key === 'Enter' && onNext()}
          autoFocus
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!groupName.trim()}>
          Next →
        </Button>
      </div>
    </div>
  );
}

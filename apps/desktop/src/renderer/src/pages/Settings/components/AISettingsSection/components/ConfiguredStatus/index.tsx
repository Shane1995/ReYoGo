import { Badge, Button } from '@reyogo/ui';
import { CheckCircle2 } from 'lucide-react';

type Props = {
  onClear: () => void;
};

export function ConfiguredStatus({ onClear }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="gap-1 border-emerald-300 text-emerald-700 dark:border-emerald-700/60 dark:text-emerald-400"
        >
          <CheckCircle2 className="size-3" /> Configured
        </Badge>
        <p className="text-sm text-muted-foreground">AI features are ready to use.</p>
      </div>
      <Button
        variant="ghost"
        onClick={onClear}
        className="self-start text-destructive hover:text-destructive"
      >
        Clear key
      </Button>
    </div>
  );
}

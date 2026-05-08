import { Button } from "@/components/ui/button";

interface StepNavProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  onSkip?: () => void;
  skipDisabled?: boolean;
}

export function StepNav({ onBack, onNext, nextDisabled, onSkip, skipDisabled }: StepNavProps) {
  return (
    <div className="flex justify-between">
      <Button variant="ghost" size="sm" onClick={onBack}>
        Back
      </Button>
      <div className="flex gap-2">
        {onSkip && (
          <Button variant="outline" size="sm" onClick={onSkip} disabled={skipDisabled}>
            Skip
          </Button>
        )}
        <Button onClick={onNext} disabled={nextDisabled}>
          Next
        </Button>
      </div>
    </div>
  );
}

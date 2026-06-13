import { FormatGuide } from '../FormatGuide';
import { DropZone } from '../DropZone';
import type { IdlePhaseProps } from './types';

export function IdlePhase({ state, onChoose }: IdlePhaseProps) {
  if (state.phase !== 'idle') return null;
  return (
    <div className="space-y-4">
      <FormatGuide />
      <DropZone onClick={onChoose} disabled={false} />
    </div>
  );
}

import { FormatGuide } from '../FormatGuide';
import { DropZone } from '../DropZone';
import type { PageState } from '../../types';

export function IdlePhase({ state, onChoose }: { state: PageState; onChoose: () => void }) {
  if (state.phase !== 'idle') return null;
  return (
    <div className="space-y-4">
      <FormatGuide />
      <DropZone onClick={onChoose} disabled={false} />
    </div>
  );
}

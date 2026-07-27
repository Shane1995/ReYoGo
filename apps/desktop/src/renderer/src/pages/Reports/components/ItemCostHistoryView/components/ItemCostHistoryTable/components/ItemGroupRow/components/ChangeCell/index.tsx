import { Badge } from '@reyogo/ui';
import { changeCls } from '@/pages/Inventory/Analysis/utils/styles';
import { changeLabelOf } from './utils/changeLabelOf';
import type { ChangeCellProps } from './types';

export function ChangeCell({ change, flagged }: ChangeCellProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className={changeCls(change)}>{changeLabelOf(change)}</span>
      {flagged && <Badge variant="destructive">Jump</Badge>}
    </div>
  );
}

import { CollapseToggle } from '../CollapseToggle';
import type { FixedNavBodyProps } from './types';

export function FixedNavBody({ items, bottomItems, collapsed, onToggle }: FixedNavBodyProps) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 p-3">
      {items}
      {bottomItems}
      <div className="mt-auto">
        <CollapseToggle collapsed={collapsed} onClick={onToggle} />
      </div>
    </div>
  );
}

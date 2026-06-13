import { CollapseToggle } from '../CollapseToggle';
import type { ScrollableNavBodyProps } from './types';

export function ScrollableNavBody({
  items,
  bottomItems,
  collapsed,
  onToggle,
}: ScrollableNavBodyProps) {
  return (
    <>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">{items}</nav>
      <div className="shrink-0 border-t border-[rgba(255,255,255,0.07)]">
        {bottomItems && <div className="px-2 pt-2">{bottomItems}</div>}
        <div className="p-2">
          <CollapseToggle collapsed={collapsed} onClick={onToggle} />
        </div>
      </div>
    </>
  );
}

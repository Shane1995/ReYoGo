import { NavItemList } from '../NavItemList';
import { ScrollableNavBody } from '../ScrollableNavBody';
import { FixedNavBody } from '../FixedNavBody';
import type { NavContentProps } from './types';

export function NavContent({
  navItems,
  bottomNavItems,
  collapsed,
  iconClassName,
  scrollable,
  onToggle,
}: NavContentProps) {
  const items = (
    <NavItemList navItems={navItems} collapsed={collapsed} iconClassName={iconClassName} />
  );
  const bottomItems =
    bottomNavItems && bottomNavItems.length > 0 ? (
      <NavItemList navItems={bottomNavItems} collapsed={collapsed} iconClassName={iconClassName} />
    ) : null;

  if (scrollable) {
    return (
      <ScrollableNavBody
        items={items}
        bottomItems={bottomItems}
        collapsed={collapsed}
        onToggle={onToggle}
      />
    );
  }
  return (
    <FixedNavBody
      items={items}
      bottomItems={bottomItems}
      collapsed={collapsed}
      onToggle={onToggle}
    />
  );
}

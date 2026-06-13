import { useNavItems } from '@/config/nav';
import { CollapsibleNav } from '@/components/CollapsibleNav';
import { EXPANDED_WIDTH, COLLAPSED_WIDTH, SETTINGS_NAV_ITEM, SIDEBAR_STYLE } from './constants';

export function AppSidebar() {
  const { primary } = useNavItems();

  return (
    <CollapsibleNav
      navItems={primary}
      storageKey="sidebar-primary-collapsed"
      width={{ expanded: EXPANDED_WIDTH, collapsed: COLLAPSED_WIDTH }}
      bottomNavItems={[SETTINGS_NAV_ITEM]}
      scrollable
      className="h-full border-r border-[rgba(255,255,255,0.08)]"
      style={SIDEBAR_STYLE}
    />
  );
}

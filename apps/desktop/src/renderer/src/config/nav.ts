import type { LucideIcon } from 'lucide-react';
import type { NavItemConfig } from './app.config';
import { resolveIcon, resolvePath } from './resolvers';
import { useAppConfig } from '@/Context';

export interface ResolvedNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end: boolean;
}

function hydrateNavItems(items: NavItemConfig[]): ResolvedNavItem[] {
  return items.map((item) => ({
    label: item.label,
    path: resolvePath(item.pathKey),
    icon: resolveIcon(item.icon),
    end: item.end,
  }));
}

export function useNavItems() {
  const { config } = useAppConfig();
  return {
    primary: hydrateNavItems(config.nav.primary),
    stock: hydrateNavItems(config.nav.stock),
    invoices: hydrateNavItems(config.nav.invoices),
    costing: hydrateNavItems(config.nav.costing),
    settings: hydrateNavItems(config.nav.settings),
  };
}

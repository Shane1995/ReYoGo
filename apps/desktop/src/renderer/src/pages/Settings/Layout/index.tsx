import { useNavItems } from '@/config/nav';
import { SectionLayout } from '@/layouts/SectionLayout';

export function SettingsLayout() {
  const { settings } = useNavItems();
  return <SectionLayout navItems={settings} storageKey="sidebar-settings-collapsed" />;
}

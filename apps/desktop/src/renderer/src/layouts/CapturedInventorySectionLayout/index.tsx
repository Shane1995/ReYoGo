import { useNavItems } from '@/config/nav';
import { SectionLayout } from '@/layouts/SectionLayout';

export function CapturedInventorySectionLayout() {
  const { stock } = useNavItems();
  return <SectionLayout navItems={stock} />;
}

import { useNavItems } from '@/config/nav';
import { SectionLayout } from '@/layouts/SectionLayout';

export function CostingLayout() {
  const { costing } = useNavItems();
  return <SectionLayout navItems={costing} />;
}

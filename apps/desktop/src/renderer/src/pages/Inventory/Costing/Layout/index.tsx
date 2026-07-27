import { useNavItems } from '@/config/nav';
import { InventoryProvider } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { SectionLayout } from '@/layouts/SectionLayout';

export function CostingLayout() {
  const { costing } = useNavItems();
  return (
    <InventoryProvider>
      <SectionLayout navItems={costing} />
    </InventoryProvider>
  );
}

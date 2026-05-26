import { useNavItems } from '@/config/nav';
import { SectionLayout } from '@/layouts/SectionLayout';
import { InventoryProvider } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';

export function CapturedInventorySectionLayout() {
  const { stock } = useNavItems();
  return (
    <InventoryProvider>
      <SectionLayout navItems={stock} />
    </InventoryProvider>
  );
}

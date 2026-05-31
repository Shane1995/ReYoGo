import { Outlet } from 'react-router-dom';
import { useNavItems } from '@/config/nav';
import { InventoryProvider } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { SectionLayout } from '@/layouts/SectionLayout';

export function InvoiceLayout() {
  const { invoices } = useNavItems();
  return (
    <InventoryProvider>
      <SectionLayout navItems={invoices}>
        <Outlet />
      </SectionLayout>
    </InventoryProvider>
  );
}

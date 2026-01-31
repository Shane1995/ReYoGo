import { Outlet } from "react-router-dom";
import { InventoryProvider } from "../../Context/InventoryContext";

export function InventoryLayout() {
  return (
    <InventoryProvider>
      <Outlet />
    </InventoryProvider>
  );
}

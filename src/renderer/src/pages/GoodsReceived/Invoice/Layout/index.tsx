import { Outlet } from "react-router-dom";
import { InventoryProvider } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Context/InventoryContext";

export function InvoiceLayout() {
  return (
    <InventoryProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </InventoryProvider>
  );
}

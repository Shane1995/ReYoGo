import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import InventoryLayout from "@/layouts/InventoryLayout";
import { CapturedInventorySectionLayout } from "@/layouts/CapturedInventorySectionLayout";
import { AnalysisSectionLayout } from "@/layouts/AnalysisSectionLayout";
import InventoryOverview from "@/pages/Inventory/Overview";
import { CaptureLayout } from "@/pages/Inventory/Capture/Layout";
import { InventoryLayout as CapturedInventoryLayout } from "@/pages/Inventory/Capture/CapturedInventory/Layout/InventoryLayout";
import CapturedInventoryIndex from "@/pages/Inventory/Capture/CapturedInventory";
import ImportPage from "@/pages/Inventory/Capture/CapturedInventory/ImportPage";
import AddItemsPage from "@/pages/Inventory/Capture/AddItemsPage";
import AddCategoriesPage from "@/pages/Inventory/Capture/AddCategoriesPage";
import ManageTypesPage from "@/pages/Inventory/Capture/ManageTypesPage";
import { InvoiceLayout } from "@/pages/Inventory/Invoice/Layout";
import InvoicePage from "@/pages/Inventory/Invoice";
import InvoiceHistoryPage from "@/pages/Inventory/Invoice/History";
import InventoryAnalysis from "@/pages/Inventory/Analysis";
import ItemTrendPage from "@/pages/Inventory/Analysis/ItemTrendPage";
import { CostingLayout } from "@/pages/Inventory/Costing/Layout";
import CostingDashboard from "@/pages/Inventory/Costing/Dashboard";
import PriceVariancePage from "@/pages/Inventory/Costing/PriceVariance";
import CostReportPage from "@/pages/Inventory/Costing/CostReport";
import {
  ProductRoutes,
  UserRoutes,
  InventoryCaptureRoutes,
  InventoryRouteSegments,
  CostingRoutes,
} from "./routePaths";

export {
  ProductRoutes,
  InventoryCaptureRoutes,
  InvoiceRoutes,
  AnalysisRoutes,
  CostingRoutes,
  UserRoutes,
  InventoryRouteSegments,
} from "./routePaths";

export function AppRoutesComponent() {
  return (
    <Routes>
      <Route path={UserRoutes.Home} element={<AppLayout />}>
        <Route index element={<Navigate to={ProductRoutes.Inventory} replace />} />
        <Route path={InventoryRouteSegments.root} element={<InventoryLayout />}>
          <Route index element={<InventoryOverview />} />

          <Route element={<AnalysisSectionLayout />}>
            <Route path={InventoryRouteSegments.analysis} element={<InventoryAnalysis />} />
            <Route path={`${InventoryRouteSegments.analysis}/item/:itemId`} element={<ItemTrendPage />} />
          </Route>

          <Route element={<CapturedInventorySectionLayout />}>
            <Route path={InventoryRouteSegments.capture} element={<CaptureLayout />}>
              <Route element={<CapturedInventoryLayout />}>
                <Route index element={<Navigate to={InventoryCaptureRoutes.CapturedInventory} replace />} />
                <Route path={InventoryRouteSegments.capturedInventory}>
                  <Route index element={<CapturedInventoryIndex />} />
                  <Route path={InventoryRouteSegments.import} element={<ImportPage />} />
                </Route>
                <Route path={InventoryRouteSegments.items} element={<AddItemsPage />} />
                <Route path={InventoryRouteSegments.categories} element={<AddCategoriesPage />} />
                <Route path={InventoryRouteSegments.goodTypes} element={<ManageTypesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path={InventoryRouteSegments.costing} element={<CostingLayout />}>
            <Route index element={<Navigate to={CostingRoutes.Dashboard} replace />} />
            <Route path={InventoryRouteSegments.costingDashboard} element={<CostingDashboard />} />
            <Route path={InventoryRouteSegments.costingPriceVariance} element={<PriceVariancePage />} />
            <Route path={InventoryRouteSegments.costingCostReport} element={<CostReportPage />} />
          </Route>

          <Route path={InventoryRouteSegments.invoice} element={<InvoiceLayout />}>
            <Route index element={<InvoicePage />} />
            <Route path={InventoryRouteSegments.invoiceHistory} element={<InvoiceHistoryPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { CapturedInventorySectionLayout } from '@/layouts/CapturedInventorySectionLayout';
import { InventoryLayout as CapturedInventoryLayout } from '@/pages/Inventory/Capture/CapturedInventory/Layout/InventoryLayout';
import CapturedInventoryIndex from '@/pages/Inventory/Capture/CapturedInventory';
import ImportPage from '@/pages/Inventory/Capture/CapturedInventory/ImportPage';
import AddItemsPage from '@/pages/Inventory/Capture/AddItemsPage';
import AddCategoriesPage from '@/pages/Inventory/Capture/AddCategoriesPage';
import { InvoiceLayout } from '@/pages/Inventory/Invoice/Layout';
import InvoicePage from '@/pages/Inventory/Invoice';
import InvoiceHistoryPage from '@/pages/Inventory/Invoice/History';
import InventoryAnalysis from '@/pages/Inventory/Analysis';
import ItemTrendPage from '@/pages/Inventory/Analysis/ItemTrendPage';
import { CostingLayout } from '@/pages/Inventory/Costing/Layout';
import CostingDashboard from '@/pages/Inventory/Costing/Dashboard';
import PriceVariancePage from '@/pages/Inventory/Costing/PriceVariance';
import CostReportPage from '@/pages/Inventory/Costing/CostReport';
import DashboardPage from '@/pages/Dashboard';
import SuppliersPage from '@/pages/Suppliers';
import {
  UserRoutes,
  StockRouteSegments,
  InvoiceRouteSegments,
  CostingRouteSegments,
  SuppliersRouteSegments,
} from './routePaths';

export {
  StockRoutes,
  InvoiceRoutes,
  CostingRoutes,
  SuppliersRoutes,
  UserRoutes,
  StockRouteSegments,
  InvoiceRouteSegments,
  CostingRouteSegments,
  SuppliersRouteSegments,
  // Backward-compat aliases
  AnalysisRoutes,
  ProductRoutes,
  itemTrendPath,
} from './routePaths';

export function AppRoutesComponent() {
  return (
    <Routes>
      <Route path={UserRoutes.Home} element={<AppLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path={StockRouteSegments.root} element={<CapturedInventorySectionLayout />}>
          <Route element={<CapturedInventoryLayout />}>
            <Route index element={<CapturedInventoryIndex />} />
            <Route path={StockRouteSegments.import} element={<ImportPage />} />
            <Route path={StockRouteSegments.addItems} element={<AddItemsPage />} />
            <Route path={StockRouteSegments.categories} element={<AddCategoriesPage />} />
          </Route>
          <Route path={StockRouteSegments.analysis} element={<InventoryAnalysis />} />
          <Route path={`${StockRouteSegments.analysis}/item/:itemId`} element={<ItemTrendPage />} />
        </Route>

        <Route path={InvoiceRouteSegments.root} element={<InvoiceLayout />}>
          <Route index element={<InvoicePage />} />
          <Route path={InvoiceRouteSegments.history} element={<InvoiceHistoryPage />} />
        </Route>

        <Route path={CostingRouteSegments.root} element={<CostingLayout />}>
          <Route index element={<CostingDashboard />} />
          <Route path={CostingRouteSegments.priceVariance} element={<PriceVariancePage />} />
          <Route path={CostingRouteSegments.costReport} element={<CostReportPage />} />
        </Route>

        <Route path={SuppliersRouteSegments.root} element={<SuppliersPage />} />
      </Route>
    </Routes>
  );
}

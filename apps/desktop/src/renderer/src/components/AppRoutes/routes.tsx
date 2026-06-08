import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { CapturedInventorySectionLayout } from '@/layouts/CapturedInventorySectionLayout';
import { InventoryLayout as CapturedInventoryLayout } from '@/pages/Inventory/Capture/CapturedInventory/Layout/InventoryLayout';
import CapturedInventoryIndex from '@/pages/Inventory/Capture/CapturedInventory';
import AddInventoryPage from '@/pages/Inventory/Capture/AddInventoryPage';
import { InvoiceLayout } from '@/pages/Invoices/Layout';
import InvoicePage from '@/pages/Invoices';
import InvoiceHistoryPage from '@/pages/Invoices/History';
import ManagePage from '@/pages/Inventory/Manage';
import InventoryAnalysis from '@/pages/Inventory/Analysis';
import ItemTrendPage from '@/pages/Inventory/Analysis/ItemTrendPage';
import { CostingLayout } from '@/pages/Inventory/Costing/Layout';
import CostingDashboard from '@/pages/Inventory/Costing/Dashboard';
import PriceVariancePage from '@/pages/Inventory/Costing/PriceVariance';
import CostReportPage from '@/pages/Inventory/Costing/CostReport';
import DashboardPage from '@/pages/Dashboard';
import SuppliersPage from '@/pages/Suppliers';
import SettingsPage from '@/pages/Settings';
import {
  UserRoutes,
  StockRouteSegments,
  InvoiceRouteSegments,
  CostingRouteSegments,
  SuppliersRouteSegments,
  SettingsRouteSegments,
} from './routePaths';

export function AppRoutesComponent() {
  return (
    <Routes>
      <Route path={UserRoutes.Home} element={<AppLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path={StockRouteSegments.root} element={<CapturedInventorySectionLayout />}>
          <Route element={<CapturedInventoryLayout />}>
            <Route index element={<CapturedInventoryIndex />} />
            <Route path={StockRouteSegments.addItems} element={<AddInventoryPage />} />
            <Route path={StockRouteSegments.categories} element={<AddInventoryPage />} />
          </Route>
          <Route path={StockRouteSegments.analysis} element={<InventoryAnalysis />} />
          <Route path={StockRouteSegments.manage} element={<ManagePage />} />
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
        <Route path={SettingsRouteSegments.root} element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

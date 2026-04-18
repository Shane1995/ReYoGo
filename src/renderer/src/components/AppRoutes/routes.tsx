import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import GoodsReceivedLayout from "@/layouts/GoodsReceivedLayout";
import { CapturedGoodsSectionLayout } from "@/layouts/CapturedGoodsSectionLayout";
import { AnalysisSectionLayout } from "@/layouts/AnalysisSectionLayout";
import GoodsReceivedOverview from "@/pages/GoodsReceived/Overview";
import { CaptureLayout } from "@/pages/GoodsReceived/Capture/Layout";
import { InventoryLayout } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Layout/InventoryLayout";
import CapturedGoodsReceivedIndex from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived";
import ImportPage from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/ImportPage";
import AddItemsPage from "@/pages/GoodsReceived/Capture/AddItemsPage";
import AddCategoriesPage from "@/pages/GoodsReceived/Capture/AddCategoriesPage";
import ManageTypesPage from "@/pages/GoodsReceived/Capture/ManageTypesPage";
import { InvoiceLayout } from "@/pages/GoodsReceived/Invoice/Layout";
import InvoicePage from "@/pages/GoodsReceived/Invoice";
import InvoiceHistoryPage from "@/pages/GoodsReceived/Invoice/History";
import GoodsReceivedAnalysis from "@/pages/GoodsReceived/Analysis";
import {
  ProductRoutes,
  UserRoutes,
  GoodsReceivedCaptureRoutes,
  GoodsReceivedRouteSegments,
} from "./routePaths";

export {
  ProductRoutes,
  GoodsReceivedCaptureRoutes,
  InvoiceRoutes,
  AnalysisRoutes,
  UserRoutes,
  GoodsReceivedRouteSegments,
} from "./routePaths";

export function AppRoutesComponent() {
  return (
    <Routes>
      <Route path={UserRoutes.Home} element={<AppLayout />}>
        <Route index element={<Navigate to={ProductRoutes.GoodsReceived} replace />} />
        <Route path={GoodsReceivedRouteSegments.root} element={<GoodsReceivedLayout />}>
          <Route index element={<GoodsReceivedOverview />} />

          <Route element={<AnalysisSectionLayout />}>
            <Route path={GoodsReceivedRouteSegments.analysis} element={<GoodsReceivedAnalysis />} />
          </Route>

          <Route element={<CapturedGoodsSectionLayout />}>
            <Route path={GoodsReceivedRouteSegments.capture} element={<CaptureLayout />}>
              <Route element={<InventoryLayout />}>
                <Route index element={<Navigate to={GoodsReceivedCaptureRoutes.CapturedGoodsReceived} replace />} />
                <Route path={GoodsReceivedRouteSegments.capturedGoodsReceived}>
                  <Route index element={<CapturedGoodsReceivedIndex />} />
                  <Route path={GoodsReceivedRouteSegments.import} element={<ImportPage />} />
                </Route>
                <Route path={GoodsReceivedRouteSegments.items} element={<AddItemsPage />} />
                <Route path={GoodsReceivedRouteSegments.categories} element={<AddCategoriesPage />} />
                <Route path={GoodsReceivedRouteSegments.goodTypes} element={<ManageTypesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path={GoodsReceivedRouteSegments.invoice} element={<InvoiceLayout />}>
            <Route index element={<InvoicePage />} />
            <Route path={GoodsReceivedRouteSegments.invoiceHistory} element={<InvoiceHistoryPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

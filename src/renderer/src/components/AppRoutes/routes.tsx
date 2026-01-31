import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import GoodsReceivedLayout from "@/layouts/GoodsReceivedLayout";
import GoodsReceivedOverview from "@/pages/GoodsReceived/Overview";
import GoodsReceivedAbout from "@/pages/GoodsReceived/About";
import { CaptureLayout } from "@/pages/GoodsReceived/Capture/CaptureLayout";
import { InventoryLayout } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Layout/InventoryLayout";
import CapturedGoodsReceivedIndex from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived";
import AddItemsPage from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/AddItems";
import AddCategoriesPage from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/AddCategories";
import { InvoiceLayout } from "@/pages/GoodsReceived/Invoice/InvoiceLayout";
import InvoicePage from "@/pages/GoodsReceived/Invoice";
import InvoiceHistoryPage from "@/pages/GoodsReceived/Invoice/History";
import GoodsReceivedHistory from "@/pages/GoodsReceived/History";
import GoodsReceivedAnalysis from "@/pages/GoodsReceived/Analysis";
import {
  ProductRoutes,
  UserRoutes,
  GoodsReceivedCaptureRoutes,
  InvoiceRoutes,
  GoodsReceivedRouteSegments,
} from "./routePaths";

export {
  ProductRoutes,
  GoodsReceivedCaptureRoutes,
  InvoiceRoutes,
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
          <Route path="about" element={<GoodsReceivedAbout />} />
          <Route path={GoodsReceivedRouteSegments.history} element={<GoodsReceivedHistory />} />
          <Route path={GoodsReceivedRouteSegments.analysis} element={<GoodsReceivedAnalysis />} />
          <Route path={GoodsReceivedRouteSegments.capture} element={<CaptureLayout />}>
            <Route index element={<Navigate to={ProductRoutes.GoodsReceived} replace />} />
            <Route path={GoodsReceivedRouteSegments.capturedGoodsReceived} element={<InventoryLayout />}>
              <Route index element={<CapturedGoodsReceivedIndex />} />
              <Route path={GoodsReceivedRouteSegments.addItems} element={<AddItemsPage />} />
              <Route path={GoodsReceivedRouteSegments.addCategories} element={<AddCategoriesPage />} />
            </Route>
            <Route
              path={GoodsReceivedRouteSegments.items}
              element={<Navigate to={GoodsReceivedCaptureRoutes.CapturedGoodsReceived} replace />}
            />
            <Route
              path={GoodsReceivedRouteSegments.categories}
              element={<Navigate to={GoodsReceivedCaptureRoutes.CapturedGoodsReceived} replace />}
            />
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

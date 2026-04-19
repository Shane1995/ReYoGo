export enum ProductRoutes {
  GoodsReceivedValidation = "/goods-received",
  GoodsReceived = "/goods-received",
}

export enum GoodsReceivedCaptureRoutes {
  CapturedGoodsReceived = "/goods-received/capture/captured-goods-received",
  Import = "/goods-received/capture/captured-goods-received/import",
  Items = "/goods-received/capture/items",
  Categories = "/goods-received/capture/categories",
  GoodTypes = "/goods-received/capture/good-types",
}

export enum InvoiceRoutes {
  Base = "/goods-received/invoice",
  History = "/goods-received/invoice/history",
}

export enum AnalysisRoutes {
  CostPerUnit = "/goods-received/analysis",
  ItemTrend = "/goods-received/analysis/item/:itemId",
}

export function itemTrendPath(itemId: string) {
  return `/goods-received/analysis/item/${itemId}`;
}

export enum UserRoutes {
  Home = "/",
}

export enum GoodsReceivedRouteSegments {
  root = "goods-received",
  capture = "capture",
  capturedGoodsReceived = "captured-goods-received",
  import = "import",
  items = "items",
  categories = "categories",
  goodTypes = "good-types",
  invoice = "invoice",
  invoiceHistory = "history",
  analysis = "analysis",
  view = "view",
  add = "add",
}

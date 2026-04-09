export enum ProductRoutes {
  GoodsReceivedValidation = "/goods-received",
  GoodsReceived = "/goods-received",
}

export enum GoodsReceivedCaptureRoutes {
  CapturedGoodsReceived = "/goods-received/capture/captured-goods-received",
  AddItems = "/goods-received/capture/captured-goods-received/add-items",
  AddCategories = "/goods-received/capture/captured-goods-received/add-categories",
  Items = "/goods-received/capture/items",
  Categories = "/goods-received/capture/categories",
}

/** Invoice domain: capture and history. */
export enum InvoiceRoutes {
  Base = "/goods-received/invoice",
  History = "/goods-received/invoice/history",
}

/** Analysis domain. */
export enum AnalysisRoutes {
  CostPerUnit = "/goods-received/analysis",
}

export enum UserRoutes {
  Home = "/",
}

export const GoodsReceivedRouteSegments = {
  root: ProductRoutes.GoodsReceived.slice(1),
  capture: "capture",
  capturedGoodsReceived: "captured-goods-received",
  addItems: "add-items",
  addCategories: "add-categories",
  items: "items",
  categories: "categories",
  invoice: "invoice",
  invoiceHistory: "history",
  history: "history",
  analysis: "analysis",
  view: "view",
  add: "add",
} as const;

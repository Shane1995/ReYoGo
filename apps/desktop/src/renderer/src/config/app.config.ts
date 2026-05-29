export interface NavItemConfig {
  label: string;
  pathKey: string;
  icon: string;
  end: boolean;
}

export interface RouteConfig {
  home: string;
  stock: string;
  'stock.import': string;
  'stock.addItems': string;
  'stock.categories': string;
  'stock.analysis': string;
  invoices: string;
  'invoices.history': string;
  costing: string;
  'costing.priceVariance': string;
  'costing.costReport': string;
  suppliers: string;
  settings: string;
  'settings.business': string;
  'settings.tax': string;
  [key: string]: string;
}

export interface DynamicStatCardConfig {
  label: string;
  dataKey: 'totalStockValue' | 'monthlySpend';
  format: 'ZAR';
  icon: string;
  iconClassName: string;
}

export interface StaticStatCardConfig {
  label: string;
  staticValue: string | number;
  icon: string;
  iconClassName: string;
}

export type StatCardConfig = DynamicStatCardConfig | StaticStatCardConfig;

export interface AppConfig {
  routes: RouteConfig;
  nav: {
    primary: NavItemConfig[];
    stock: NavItemConfig[];
    invoices: NavItemConfig[];
    costing: NavItemConfig[];
  };
  dashboard: {
    statCards: StatCardConfig[];
  };
}

export const appConfig: AppConfig = {
  routes: {
    home: '/',
    stock: '/stock',
    'stock.import': '/stock/import',
    'stock.addItems': '/stock/add-items',
    'stock.categories': '/stock/categories',
    'stock.analysis': '/stock/analysis',
    invoices: '/invoices',
    'invoices.history': '/invoices/history',
    costing: '/costing',
    'costing.priceVariance': '/costing/price-variance',
    'costing.costReport': '/costing/cost-report',
    suppliers: '/suppliers',
    settings: '/settings',
    'settings.business': '/settings/business',
    'settings.tax': '/settings/tax',
  },
  nav: {
    primary: [
      { label: 'Dashboard', pathKey: 'home', icon: 'LayoutDashboard', end: true },
      { label: 'Stock', pathKey: 'stock', icon: 'Package', end: false },
      { label: 'Invoices', pathKey: 'invoices', icon: 'Receipt', end: false },
      { label: 'Costing', pathKey: 'costing', icon: 'Coins', end: false },
      { label: 'Suppliers', pathKey: 'suppliers', icon: 'Truck', end: false },
    ],
    stock: [
      { label: 'Captured Inventory', pathKey: 'stock', icon: 'PackagePlus', end: true },
      { label: 'Add Items', pathKey: 'stock.addItems', icon: 'ListPlus', end: true },
      { label: 'Add Categories', pathKey: 'stock.categories', icon: 'FolderPlus', end: true },
      { label: 'Import', pathKey: 'stock.import', icon: 'Upload', end: false },
      { label: 'Analysis', pathKey: 'stock.analysis', icon: 'TrendingUp', end: false },
    ],
    invoices: [
      { label: 'Capture Invoice', pathKey: 'invoices', icon: 'Receipt', end: true },
      { label: 'History', pathKey: 'invoices.history', icon: 'History', end: false },
    ],
    costing: [
      { label: 'Dashboard', pathKey: 'costing', icon: 'LayoutDashboard', end: true },
      {
        label: 'Price Variance',
        pathKey: 'costing.priceVariance',
        icon: 'ArrowUpDown',
        end: false,
      },
      { label: 'Cost Report', pathKey: 'costing.costReport', icon: 'FileBarChart2', end: false },
    ],
  },
  dashboard: {
    statCards: [
      {
        label: 'Total Stock Value',
        dataKey: 'totalStockValue',
        format: 'ZAR',
        icon: 'Package',
        iconClassName: 'bg-[#E6FAF5]',
      },
      {
        label: 'Monthly Spend',
        dataKey: 'monthlySpend',
        format: 'ZAR',
        icon: 'ShoppingCart',
        iconClassName: 'bg-[#E0F2FE]',
      },
      {
        label: 'Low Stock Items',
        staticValue: 0,
        icon: 'AlertTriangle',
        iconClassName: 'bg-[#FFF3CD]',
      },
      {
        label: 'Waste — 30 days',
        staticValue: 'R 0.00',
        icon: 'Trash',
        iconClassName: 'bg-[#FEE2E2]',
      },
    ],
  },
};

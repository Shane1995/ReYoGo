import { describe, it, expect } from 'vitest';
import {
  UserRoutes,
  StockRoutes,
  InvoiceRoutes,
  StockRouteSegments,
  InvoiceRouteSegments,
  CostingRouteSegments,
  SuppliersRouteSegments,
  AnalysisRoutes,
  itemTrendPath,
} from '.';

describe('itemTrendPath', () => {
  it('builds a path with the given item id', () => {
    expect(itemTrendPath('abc-123')).toBe('/stock/analysis/item/abc-123');
  });

  it('includes the base stock analysis segment', () => {
    expect(itemTrendPath('x')).toContain('/stock/analysis/item/');
  });
});

describe('UserRoutes', () => {
  it('Home is the root path', () => {
    expect(UserRoutes.Home).toBe('/');
  });
});

describe('StockRoutes', () => {
  it('Base is /stock', () => {
    expect(StockRoutes.Base).toBe('/stock');
  });

  it('Import is /stock/import', () => {
    expect(StockRoutes.Import).toBe('/stock/import');
  });
});

describe('InvoiceRoutes', () => {
  it('Base is /invoices', () => {
    expect(InvoiceRoutes.Base).toBe('/invoices');
  });

  it('History is nested under /invoices', () => {
    expect(InvoiceRoutes.History).toBe('/invoices/history');
  });
});

describe('StockRouteSegments', () => {
  it('root is stock', () => {
    expect(StockRouteSegments.root).toBe('stock');
  });

  it('import is import', () => {
    expect(StockRouteSegments.import).toBe('import');
  });
});

describe('InvoiceRouteSegments', () => {
  it('root is invoices', () => {
    expect(InvoiceRouteSegments.root).toBe('invoices');
  });
});

describe('CostingRouteSegments', () => {
  it('root is costing', () => {
    expect(CostingRouteSegments.root).toBe('costing');
  });
});

describe('SuppliersRouteSegments', () => {
  it('root is suppliers', () => {
    expect(SuppliersRouteSegments.root).toBe('suppliers');
  });
});

describe('AnalysisRoutes backward-compat alias', () => {
  it('CostPerUnit points to the stock analysis path', () => {
    expect(AnalysisRoutes.CostPerUnit).toBe('/stock/analysis');
  });
});

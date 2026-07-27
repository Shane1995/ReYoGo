import { describe, it, expect } from 'vitest';
import { metadataRowsOf } from '.';
import { ReportView } from '../../../../types';
import type { ExportRequest } from '../../../../types';

describe('metadataRowsOf', () => {
  it('shows the date range when both dates are set', () => {
    const request: ExportRequest = {
      view: ReportView.ItemCostHistory,
      rows: [],
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    };
    expect(metadataRowsOf(request)).toEqual([['Date range: 2026-01-01 to 2026-01-31'], []]);
  });

  it('shows "All dates" when neither date is set', () => {
    const request: ExportRequest = {
      view: ReportView.PeriodSummary,
      cogs: { total: 0, byCategory: [] },
      fromDate: '',
      toDate: '',
    };
    expect(metadataRowsOf(request)).toEqual([['Date range: All dates'], []]);
  });

  it('shows "From <date>" when only fromDate is set', () => {
    const request: ExportRequest = {
      view: ReportView.ItemCostHistory,
      rows: [],
      fromDate: '2026-01-01',
      toDate: '',
    };
    expect(metadataRowsOf(request)).toEqual([['Date range: From 2026-01-01'], []]);
  });

  it('shows "To <date>" when only toDate is set', () => {
    const request: ExportRequest = {
      view: ReportView.PeriodSummary,
      cogs: { total: 0, byCategory: [] },
      fromDate: '',
      toDate: '2026-01-31',
    };
    expect(metadataRowsOf(request)).toEqual([['Date range: To 2026-01-31'], []]);
  });

  it('shows the as-of date for Stock Valuation', () => {
    const request: ExportRequest = {
      view: ReportView.StockValuation,
      rows: [],
      asOfDate: '2026-06-01',
    };
    expect(metadataRowsOf(request)).toEqual([['As of: 2026-06-01'], []]);
  });

  it('shows "Live" for Stock on Hand when no as-of date is set', () => {
    const request: ExportRequest = { view: ReportView.StockOnHand, rows: [], asOfDate: '' };
    expect(metadataRowsOf(request)).toEqual([['As of: Live'], []]);
  });
});

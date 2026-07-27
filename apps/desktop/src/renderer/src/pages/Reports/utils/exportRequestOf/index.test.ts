import { describe, it, expect } from 'vitest';
import { exportRequestOf } from '.';
import { ReportView } from '../../types';
import type { ExportState } from './types';

const baseState: ExportState = {
  activeView: ReportView.ItemCostHistory,
  fromDate: '2026-01-01',
  toDate: '2026-01-31',
  asOfDate: '',
  itemCostHistoryRows: [],
  periodSummaryCogs: null,
  stockValuationRows: [],
  stockOnHandRows: [],
};

describe('exportRequestOf', () => {
  it('builds an Item Cost History request with the current date range', () => {
    const request = exportRequestOf(baseState);
    expect(request).toEqual({
      view: ReportView.ItemCostHistory,
      rows: [],
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });
  });

  it('returns null for Period Summary when cogs has not loaded yet', () => {
    const request = exportRequestOf({ ...baseState, activeView: ReportView.PeriodSummary });
    expect(request).toBeNull();
  });

  it('builds a Period Summary request once cogs is available', () => {
    const cogs = { total: 100, byCategory: [] };
    const request = exportRequestOf({
      ...baseState,
      activeView: ReportView.PeriodSummary,
      periodSummaryCogs: cogs,
    });
    expect(request).toEqual({
      view: ReportView.PeriodSummary,
      cogs,
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });
  });

  it('builds a Stock Valuation request with the current as-of date', () => {
    const request = exportRequestOf({
      ...baseState,
      activeView: ReportView.StockValuation,
      asOfDate: '2026-06-01',
    });
    expect(request).toEqual({ view: ReportView.StockValuation, rows: [], asOfDate: '2026-06-01' });
  });

  it('builds a Stock on Hand request with the current as-of date', () => {
    const request = exportRequestOf({
      ...baseState,
      activeView: ReportView.StockOnHand,
      asOfDate: '',
    });
    expect(request).toEqual({ view: ReportView.StockOnHand, rows: [], asOfDate: '' });
  });
});
